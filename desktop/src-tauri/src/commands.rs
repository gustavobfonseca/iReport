use std::sync::atomic::{AtomicBool, Ordering};
use tokio::time::{sleep, Duration};
use crate::models::{DeviceData, empty_device};
use crate::utils::{extract_from, extract_plist_int, extract_plist_int_signed, DeviceCommandRunner, RealCommandRunner};

fn round_to_standard_capacity(gb: u64) -> u64 {
    let standards = [16, 32, 64, 128, 256, 512, 1024];
    for &std in &standards {
        if gb <= std && (std as f64 * 0.8) <= gb as f64 {
            return std;
        }
    }
    let mut next_pow = 1024;
    while next_pow < gb {
        next_pow *= 2;
    }
    next_pow
}

/// Guard global: impede scans sobrepostos. Se um scan já está em andamento,
/// o próximo retorna imediatamente para evitar travamentos ou consumo indevido.
static SCANNING: AtomicBool = AtomicBool::new(false);

#[tauri::command]
pub async fn read_usb_device() -> Result<DeviceData, String> {
    if SCANNING.compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst).is_err() {
        return Err("scan_in_progress".to_string());
    }

    // Um device recém-plugado pode demorar a responder (pareamento/lockdown ou
    // tela ainda bloqueada). Não desiste na primeira falha: re-tenta algumas
    // vezes antes de declarar "sem dispositivo", tornando a detecção estável.
    let mut result = scan_device(&RealCommandRunner).await;
    let mut attempts = 0;
    while !result.connected && attempts < 2 {
        attempts += 1;
        sleep(Duration::from_millis(500)).await;
        result = scan_device(&RealCommandRunner).await;
    }

    SCANNING.store(false, Ordering::SeqCst);
    Ok(result)
}

/// `true` enquanto um scan está em andamento. A thread de telemetria consulta
/// isto para não acessar o device em paralelo — sessões lockdown/diagnostics
/// concorrentes no mesmo aparelho falham e derrubam a detecção.
pub fn is_scanning() -> bool {
    SCANNING.load(Ordering::SeqCst)
}

/// Orquestra o scan de um dispositivo conectado. Faz sempre varredura completa:
/// o `full_scan` já devolve `empty_device` quando não há device legível, e é a
/// thread de telemetria em background — não este comando — que mantém a bateria
/// ao vivo. Extraída com `runner` genérico para ser testável com fixtures, sem
/// hardware real.
async fn scan_device<R: DeviceCommandRunner>(runner: &R) -> DeviceData {
    full_scan(runner).await
}

/// Full Scan: dispara os 4 comandos de diagnóstico em paralelo e monta o
/// `DeviceData` completo. É a fronteira exata com o formato de saída real
/// do `ideviceinfo`/`idevicediagnostics` — coberta pelos testes de fixture
/// no fim deste arquivo.
async fn full_scan<R: DeviceCommandRunner>(runner: &R) -> DeviceData {
    let info_fut  = runner.run("ideviceinfo", &[]);
    let disk_fut  = runner.run("ideviceinfo", &["-q", "com.apple.disk_usage"]);
    let diag_fut  = runner.run("idevicediagnostics", &["ioregentry", "AppleSmartBattery"]);
    let ioreg_fut = runner.run("idevicediagnostics", &["ioreg", "IOService"]);

    let (info_out, disk_out, diag_out, ioreg_out) = tokio::join!(info_fut, disk_fut, diag_fut, ioreg_fut);

    let info = match info_out {
        Some(s) => s,
        None => return empty_device(),
    };

    // Campos corretos do ideviceinfo -q com.apple.disk_usage:
    //   Capacidade total: TotalDataCapacity (antigo) ou AmountDataCapacity (novo)
    //   Espaço livre:     TotalDataAvailable (antigo) ou AmountDataAvailable (novo)
    // TotalDiskCapacity (do ideviceinfo sem flags) é o tamanho NAND bruto (maior que o anunciado)
    // e só deve ser usado como última alternativa, sem round_to_standard_capacity.
    let mut storage_capacity = "N/A".to_string();
    let mut storage_used = "N/A".to_string();
    let mut storage_free = "N/A".to_string();

    let total_bytes_opt: Option<u64>;
    let free_bytes_opt: Option<u64>;

    if let Some(ref disk_info) = disk_out {
        // Prioridade: campo novo (Amount*) → campo antigo (Total*)
        let cap_candidates = [
            extract_from(disk_info, "AmountDataCapacity"),
            extract_from(disk_info, "TotalDataCapacity"),
        ];
        total_bytes_opt = cap_candidates.iter()
            .filter(|s| *s != "N/A" && !s.is_empty())
            .find_map(|s| s.parse::<u64>().ok().filter(|&v| v > 0));

        let free_candidates = [
            extract_from(disk_info, "AmountDataAvailable"),
            extract_from(disk_info, "TotalDataAvailable"),
        ];
        free_bytes_opt = free_candidates.iter()
            .filter(|s| *s != "N/A" && !s.is_empty())
            .find_map(|s| s.parse::<u64>().ok().filter(|&v| v > 0));
    } else {
        // Fallback: usa TotalDiskCapacity do ideviceinfo geral (NAND bruto, sem arredondar)
        total_bytes_opt = extract_from(&info, "TotalDiskCapacity")
            .parse::<u64>().ok().filter(|&v| v > 0);
        free_bytes_opt = None;
    }

    if let Some(total_bytes) = total_bytes_opt {
        let total_gb = (total_bytes as f64 / 1_073_741_824.0).round() as u64; // usar 1024^3 (GiB)
        let rounded_gb = round_to_standard_capacity(total_gb);

        if let Some(free_bytes) = free_bytes_opt {
            let free_gb = (free_bytes as f64 / 1_073_741_824.0).round() as u64;
            let used_gb = rounded_gb.saturating_sub(free_gb);
            storage_capacity = format!("{} GB", rounded_gb);
            storage_used     = format!("{} GB", used_gb);
            storage_free     = format!("{} GB", free_gb);
        } else {
            // Só a capacidade total disponível (sem espaço livre)
            storage_capacity = format!("{} GB", rounded_gb);
        }
    }

    let icloud_raw = extract_from(&info, "fm-activation-locked");
    let icloud_locked = if icloud_raw == "WUVT" || icloud_raw.to_uppercase() == "YES" {
        "BLOQUEADO".to_string()
    } else {
        "CLEAN".to_string()
    };

    let fm_account_b64 = extract_from(&info, "fm-account-masked");
    let icloud_account_masked = if fm_account_b64 != "N/A" {
        use base64::prelude::*;
        match BASE64_STANDARD.decode(&fm_account_b64) {
            Ok(bytes) => String::from_utf8_lossy(&bytes)
                .chars()
                .filter(|c| !c.is_control())
                .collect::<String>(),
            Err(_) => fm_account_b64,
        }
    } else {
        "N/A".to_string()
    };

    let fusing_raw = extract_from(&info, "FusingStatus");
    let brick_raw  = extract_from(&info, "BrickState");

    let (
        bms_voltage_mv, bms_temperature_c, bms_instant_amperage,
        battery_cycles, battery_health
    ) = if let Some(d) = diag_out {
        let temp_c = extract_plist_int_signed(&d, "Temperature") as f32 / 10.0;
        let nominal_cap = extract_plist_int(&d, "NominalChargeCapacity");
        let design_cap  = extract_plist_int(&d, "DesignCapacity");
        let calculated_health = if design_cap > 0 {
            ((nominal_cap as f32 / design_cap as f32) * 100.0).round().min(100.0) as u32
        } else { 100 };
        (
            extract_plist_int(&d, "Voltage"),
            temp_c,
            extract_plist_int_signed(&d, "InstantAmperage"),
            extract_plist_int(&d, "CycleCount"),
            calculated_health,
        )
    } else {
        (0, 0.0, 0, 0, 100)
    };

    let ioreg_str = ioreg_out.unwrap_or_default().to_lowercase();
    let biometric_status = if ioreg_str.contains("pearl") {
        "FaceID_Operacional".to_string()
    } else if ioreg_str.contains("mesa") {
        "TouchID_Operacional".to_string()
    } else {
        "FALHA_OU_AUSENTE".to_string()
    };
    let als_status = if ioreg_str.contains("als") || ioreg_str.contains("ambientlight")
        || ioreg_str.contains("lightsensor") || ioreg_str.contains("vd628") {
        "OPERACIONAL".to_string()
    } else {
        "FALHA_DE_COMUNICACAO".to_string()
    };

    DeviceData {
        connected: true,
        device_name:     extract_from(&info, "DeviceName"),
        product_type:    extract_from(&info, "ProductType"),
        chassis_serial:  extract_from(&info, "SerialNumber"),
        udid:          extract_from(&info, "UniqueDeviceID"),
        storage_capacity, storage_used, storage_free,
        brick_state:   brick_raw.to_lowercase() == "true",
        icloud_locked,
        icloud_account_masked,
        fusing_status: fusing_raw,
        baseband_status:      extract_from(&info, "BasebandStatus"),
        unknown_components:   extract_from(&info, "UnknownComponents"),
        battery_health,
        battery_cycles,
        model_number:         extract_from(&info, "ModelNumber"),
        activation_state:     extract_from(&info, "ActivationState"),
        biometric_status, als_status,
        bms_voltage_mv,
        bms_temperature_c,
        bms_instant_amperage,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[test]
    fn rounds_up_to_nearest_standard_capacity() {
        assert_eq!(round_to_standard_capacity(58), 64);
        assert_eq!(round_to_standard_capacity(120), 128);
        assert_eq!(round_to_standard_capacity(230), 256);
    }

    #[test]
    fn keeps_exact_standard_capacity() {
        assert_eq!(round_to_standard_capacity(128), 128);
        assert_eq!(round_to_standard_capacity(512), 512);
    }

    #[test]
    fn falls_back_to_next_power_of_two_above_1tb() {
        assert_eq!(round_to_standard_capacity(1500), 2048);
    }

    // ─── Testes de contrato (golden-file) ──────────────────────────────────
    //
    // Fixtures em `tests/fixtures/` reproduzem o formato REAL de saída do
    // `ideviceinfo`/`idevicediagnostics` (não são strings inventadas soltas
    // como nos testes de `utils.rs`). O objetivo é travar o contrato entre
    // este código e o formato de texto que os binários do libimobiledevice
    // devolvem, sem depender de um iPhone conectado na CI: se a Apple ou o
    // libimobiledevice mudar um nome de campo, é aqui que o teste quebra —
    // não em produção, com um laudo errado sobre um device real.

    /// Runner de teste: devolve a fixture certa para cada (programa, args),
    /// igual ao "Simulador de Dispositivos" do frontend, só que no backend.
    struct FixtureCommandRunner {
        responses: HashMap<(String, String), String>,
    }

    impl FixtureCommandRunner {
        fn new() -> Self {
            Self { responses: HashMap::new() }
        }

        fn with(mut self, program: &str, args: &[&str], fixture: &str) -> Self {
            self.responses.insert((program.to_string(), args.join(" ")), fixture.to_string());
            self
        }
    }

    impl DeviceCommandRunner for FixtureCommandRunner {
        async fn run(&self, program: &str, args: &[&str]) -> Option<String> {
            self.responses.get(&(program.to_string(), args.join(" "))).cloned()
        }
    }

    fn clean_device_runner() -> FixtureCommandRunner {
        FixtureCommandRunner::new()
            .with("ideviceinfo", &["-k", "UniqueDeviceID"], "00008110-000A2D6E3608801E")
            .with("ideviceinfo", &[], include_str!("../tests/fixtures/ideviceinfo_clean.txt"))
            .with("ideviceinfo", &["-q", "com.apple.disk_usage"], include_str!("../tests/fixtures/disk_usage_clean.txt"))
            .with("idevicediagnostics", &["ioregentry", "AppleSmartBattery"], include_str!("../tests/fixtures/battery_clean.txt"))
            .with("idevicediagnostics", &["ioreg", "IOService"], include_str!("../tests/fixtures/ioreg_clean.txt"))
    }

    fn compromised_device_runner() -> FixtureCommandRunner {
        FixtureCommandRunner::new()
            .with("ideviceinfo", &["-k", "UniqueDeviceID"], "00008030-0000000000000000")
            .with("ideviceinfo", &[], include_str!("../tests/fixtures/ideviceinfo_compromised.txt"))
            .with("ideviceinfo", &["-q", "com.apple.disk_usage"], include_str!("../tests/fixtures/disk_usage_compromised.txt"))
            .with("idevicediagnostics", &["ioregentry", "AppleSmartBattery"], include_str!("../tests/fixtures/battery_compromised.txt"))
            .with("idevicediagnostics", &["ioreg", "IOService"], include_str!("../tests/fixtures/ioreg_compromised.txt"))
    }

    #[tokio::test]
    async fn full_scan_produces_correct_laudo_for_a_clean_device() {
        let device = scan_device(&clean_device_runner()).await;

        assert!(device.connected);
        assert_eq!(device.device_name, "iPhone de Gustavo");
        assert_eq!(device.product_type, "iPhone14,2");
        assert_eq!(device.udid, "00008110-000A2D6E3608801E");
        assert_eq!(device.storage_capacity, "128 GB");
        assert_eq!(device.storage_used, "42 GB");
        assert_eq!(device.storage_free, "86 GB");
        assert!(!device.brick_state);
        assert_eq!(device.icloud_locked, "CLEAN");
        assert_eq!(device.icloud_account_masked, "N/A");
        assert_eq!(device.fusing_status, "3");
        assert_eq!(device.baseband_status, "Operacional");
        assert_eq!(device.unknown_components, "Genuíno");
        assert_eq!(device.battery_health, 94);
        assert_eq!(device.battery_cycles, 120);
        assert_eq!(device.bms_voltage_mv, 4120);
        assert_eq!(device.bms_temperature_c, 31.2);
        assert_eq!(device.bms_instant_amperage, -450);
        assert_eq!(device.biometric_status, "FaceID_Operacional");
        assert_eq!(device.als_status, "OPERACIONAL");
    }

    #[tokio::test]
    async fn full_scan_produces_correct_laudo_for_a_compromised_device() {
        let device = scan_device(&compromised_device_runner()).await;

        assert!(device.connected);
        assert_eq!(device.storage_capacity, "64 GB");
        assert_eq!(device.storage_used, "61 GB");
        assert_eq!(device.storage_free, "3 GB");
        assert!(device.brick_state);
        assert_eq!(device.icloud_locked, "BLOQUEADO");
        assert_eq!(device.icloud_account_masked, "b*****@gmail.com");
        assert_eq!(device.fusing_status, "Violation");
        assert_eq!(device.baseband_status, "Unresponsive");
        assert_eq!(device.unknown_components, "display, battery");
        assert_eq!(device.battery_health, 71);
        assert_eq!(device.battery_cycles, 580);
        assert_eq!(device.bms_voltage_mv, 3800);
        assert_eq!(device.bms_temperature_c, 41.5);
        assert_eq!(device.bms_instant_amperage, -1200);
        // Sensores de peça não genuína: nem FaceID/TouchID nem ALS respondem
        assert_eq!(device.biometric_status, "FALHA_OU_AUSENTE");
        assert_eq!(device.als_status, "FALHA_DE_COMUNICACAO");
    }

    #[tokio::test]
    async fn scan_device_returns_empty_when_udid_is_unreadable() {
        let runner = FixtureCommandRunner::new(); // nenhum comando responde -> device ilegível
        let device = scan_device(&runner).await;

        assert!(!device.connected);
    }
}

