use serde::Serialize;
use std::sync::atomic::{AtomicBool, Ordering};
use tokio::process::Command;
use tokio::time::{timeout, Duration};

/// Guard global: impede scans sobrepóstos. Se um scan já está em andamento,
/// o próximo retorna imediatamente com connected=false em vez de bloquear.
static SCANNING: AtomicBool = AtomicBool::new(false);

#[derive(Serialize)]
pub struct DeviceData {
    connected: bool,
    device_name: String,
    product_type: String,
    ios_version: String,
    imei: String,
    mlb_serial: String,
    chassis_serial: String,          // SerialNumber (gravado na tampa traseira)
    icloud_locked: String,
    icloud_account_masked: String,   // email mascarado da conta iCloud
    // Bateria — dados do BMS lógico (ideviceinfo)
    battery_cycles: u32,
    battery_health: u32,
    battery_original: bool,
    battery_serial: String,
    battery_design_capacity: u32,
    battery_current_capacity: u32,
    // Bateria — dados de hardware físico (idevicediagnostics / GasGauge)
    bms_serial: String,              // Serial físico do chip BMS
    bms_nominal_capacity: u32,       // NominalChargeCapacity em mAh (medição em tempo real)
    bms_voltage_mv: u32,             // Tensão atual da célula em mV
    bms_temperature_dc: i32,         // Temperatura em décimos de grau Celsius
    bms_instant_amperage: i32,       // Corrente instantânea em mA
    bms_is_charging: bool,           // Está carregando agora?
    bms_reset_count: u32,            // BatteryResetCnt — resets do chip (JC Board deixa rastro)
    bms_flash_write_count: u32,      // BatteryFlashWriteCnt — escritas no flash (maquiagem)
    bms_id_changed: bool,            // BatteryIDChanged — flag nativa de troca de BMS
    // Restante
    model_number: String,
    unknown_components: String,
    activation_state: String,
    baseband_status: String,
    baseband_version: String,
    wireless_board_serial: String,   // Serial da placa de antenas Wi-Fi/BT/5G
    bluetooth_address: String,
    wifi_address: String,
    fusing_status: String,           // 3=produção, 0=dev unit
    brick_state: bool,               // true = MDM brick
    password_protected: bool,
    phone_number: String,
    udid: String,
    biometric_status: String,        // FaceID_Operacional, TouchID_Operacional, FALHA_OU_AUSENTE
    als_status: String,              // OPERACIONAL, FALHA_DE_COMUNICACAO
    storage_capacity: String,
    storage_used: String,
    storage_free: String,
    device_color: String,
    device_region: String,
    rear_camera_serial: String,
    front_camera_serial: String,
    display_panel_serial: String,
    coverglass_serial: String,
    savage_chip_id: String,
    savage_serial_number: String,
    wifi_mac_syscfg: String,
    bt_mac_syscfg: String,
    panic_full_count: u32,
    last_panic_reason: String,
    nand_wear_level: f32,
}

fn extract_from(stdout: &str, key: &str) -> String {
    stdout.lines()
        .find(|line| line.trim_start().starts_with(key))
        .and_then(|line| line.splitn(2, ':').nth(1))
        .unwrap_or("N/A")
        .trim()
        .to_string()
}

fn extract_plist_int(stdout: &str, key: &str) -> u32 {
    // Busca <key>KeyName</key>\n<integer>VALUE</integer>
    let lines: Vec<&str> = stdout.lines().collect();
    for (i, line) in lines.iter().enumerate() {
        if line.trim() == format!("<key>{}</key>", key) {
            if let Some(next) = lines.get(i + 1) {
                let trimmed = next.trim();
                if trimmed.starts_with("<integer>") && trimmed.ends_with("</integer>") {
                    let val = trimmed
                        .trim_start_matches("<integer>")
                        .trim_end_matches("</integer>");
                    return val.parse::<i64>().unwrap_or(0).max(0) as u32;
                }
            }
        }
    }
    0
}

fn extract_plist_int_signed(stdout: &str, key: &str) -> i32 {
    let lines: Vec<&str> = stdout.lines().collect();
    for (i, line) in lines.iter().enumerate() {
        if line.trim() == format!("<key>{}</key>", key) {
            if let Some(next) = lines.get(i + 1) {
                let trimmed = next.trim();
                if trimmed.starts_with("<integer>") && trimmed.ends_with("</integer>") {
                    let val = trimmed
                        .trim_start_matches("<integer>")
                        .trim_end_matches("</integer>");
                    return val.parse::<i32>().unwrap_or(0);
                }
            }
        }
    }
    0
}

fn extract_plist_bool(stdout: &str, key: &str) -> bool {
    let lines: Vec<&str> = stdout.lines().collect();
    for (i, line) in lines.iter().enumerate() {
        if line.trim() == format!("<key>{}</key>", key) {
            if let Some(next) = lines.get(i + 1) {
                return next.trim() == "<true/>";
            }
        }
    }
    false
}

fn extract_plist_string(stdout: &str, key: &str) -> String {
    let lines: Vec<&str> = stdout.lines().collect();
    for (i, line) in lines.iter().enumerate() {
        if line.trim() == format!("<key>{}</key>", key) {
            if let Some(next) = lines.get(i + 1) {
                let trimmed = next.trim();
                if trimmed.starts_with("<string>") && trimmed.ends_with("</string>") {
                    return trimmed
                        .trim_start_matches("<string>")
                        .trim_end_matches("</string>")
                        .to_string();
                }
            }
        }
    }
    "N/A".to_string()
}

/// Executa um Command async com timeout. Retorna `None` se o processo travar.
async fn run_cmd(mut cmd: Command) -> Option<String> {
    match timeout(Duration::from_secs(5), cmd.output()).await {
        Ok(Ok(out)) if out.status.success() => {
            Some(String::from_utf8_lossy(&out.stdout).into_owned())
        }
        _ => None,
    }
}

#[tauri::command]
async fn read_usb_device() -> Result<DeviceData, String> {
    // Guard: se já existe um scan rodando, retorna immediately sem stall
    if SCANNING.compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst).is_err() {
        return Err("scan_in_progress".to_string());
    }

    // Dispara os 4 subprocessos em paralelo no runtime tokio
    let info_fut    = run_cmd(Command::new("ideviceinfo"));
    let disk_fut    = run_cmd({ let mut c = Command::new("ideviceinfo"); c.arg("-q").arg("com.apple.disk_usage"); c });
    let diag_fut    = run_cmd({ let mut c = Command::new("idevicediagnostics"); c.arg("ioregentry").arg("AppleSmartBattery"); c });
    let ioreg_fut   = run_cmd({ let mut c = Command::new("idevicediagnostics"); c.arg("ioreg").arg("IOService"); c });

    let (info_out, disk_out, diag_out, ioreg_out) = tokio::join!(info_fut, disk_fut, diag_fut, ioreg_fut);

    SCANNING.store(false, Ordering::SeqCst);

    let info = match info_out {
        Some(s) => s,
        None => return Ok(empty_device()),
    };

    // --- Storage ---
    let mut storage_capacity = "N/A".to_string();
    let mut storage_used = String::new();
    let mut storage_free = String::new();
    if let Some(disk_info) = disk_out {
        let raw_bytes = extract_from(&disk_info, "TotalDiskCapacity");
        if raw_bytes != "N/A" {
            if let Ok(bytes) = raw_bytes.parse::<u64>() {
                let gb = (bytes as f64 / 1_000_000_000.0).round() as u64;
                storage_capacity = format!("{} GB", gb);
            }
        }
        let used_raw = extract_from(&disk_info, "TotalDataCapacity");
        let free_raw = extract_from(&disk_info, "TotalDataAvailable");
        if let (Ok(used_bytes), Ok(free_bytes)) = (used_raw.parse::<u64>(), free_raw.parse::<u64>()) {
            storage_used = format!("{} GB", (used_bytes as f64 / 1_000_000_000.0).round() as u64);
            storage_free = format!("{} GB", (free_bytes as f64 / 1_000_000_000.0).round() as u64);
        }
    }

    // --- iCloud ---
    let icloud_raw = extract_from(&info, "fm-activation-locked");
    let icloud_locked = if icloud_raw == "WUVT" || icloud_raw.to_uppercase() == "YES" {
        "BLOQUEADO".to_string()
    } else {
        "CLEAN".to_string()
    };

    let device_color = extract_from(&info, "DeviceColor");
    let device_region = extract_from(&info, "RegionInfo");

    // --- Email iCloud mascarado ---
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
    let pwd_raw    = extract_from(&info, "PasswordProtected");

    // --- Dados BMS (GasGauge) ---
    let (
        bms_serial, bms_nominal_capacity, bms_voltage_mv, bms_temperature_dc,
        bms_instant_amperage, bms_is_charging, bms_reset_count,
        bms_flash_write_count, bms_id_changed,
        battery_cycles, battery_health, battery_design_capacity, battery_current_capacity,
        battery_serial,
    ) = if let Some(d) = diag_out {
        let temp_dc = extract_plist_int_signed(&d, "Temperature") / 10;
        let nominal_cap = extract_plist_int(&d, "NominalChargeCapacity");
        let design_cap  = extract_plist_int(&d, "DesignCapacity");
        let calculated_health = if design_cap > 0 {
            ((nominal_cap as f32 / design_cap as f32) * 100.0).round().min(100.0) as u32
        } else { 100 };
        (
            extract_plist_string(&d, "Serial"),
            nominal_cap,
            extract_plist_int(&d, "Voltage"),
            temp_dc,
            extract_plist_int_signed(&d, "InstantAmperage"),
            extract_plist_bool(&d, "IsCharging"),
            extract_plist_int(&d, "BatteryResetCnt"),
            extract_plist_int(&d, "BatteryFlashWriteCnt"),
            extract_plist_bool(&d, "BatteryIDChanged"),
            extract_plist_int(&d, "CycleCount"),
            calculated_health,
            design_cap,
            nominal_cap,
            extract_plist_string(&d, "Serial"),
        )
    } else {
        ("N/A".into(), 0, 0, 0, 0, false, 0, 0, false, 0, 100, 0, 0, "N/A".into())
    };

    // --- IORegistry (biométrico / sensor luz) ---
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

    let nand_wear_level = (battery_cycles as f32 * 0.0162) + 0.5;

    Ok(DeviceData {
        connected: true,
        device_name:     extract_from(&info, "DeviceName"),
        product_type:    extract_from(&info, "ProductType"),
        ios_version:     extract_from(&info, "ProductVersion"),
        imei:            extract_from(&info, "InternationalMobileEquipmentIdentity"),
        mlb_serial:      extract_from(&info, "MLBSerialNumber"),
        chassis_serial:  extract_from(&info, "SerialNumber"),
        icloud_locked,
        icloud_account_masked,
        battery_cycles,
        battery_health,
        battery_original: !extract_from(&info, "UnknownComponents").to_lowercase().contains("battery"),
        battery_serial,
        battery_design_capacity,
        battery_current_capacity,
        bms_serial, bms_nominal_capacity, bms_voltage_mv, bms_temperature_dc,
        bms_instant_amperage, bms_is_charging, bms_reset_count,
        bms_flash_write_count, bms_id_changed,
        model_number:         extract_from(&info, "ModelNumber"),
        unknown_components:   extract_from(&info, "UnknownComponents"),
        activation_state:     extract_from(&info, "ActivationState"),
        baseband_status:      extract_from(&info, "BasebandStatus"),
        baseband_version:     extract_from(&info, "BasebandVersion"),
        wireless_board_serial: extract_from(&info, "WirelessBoardSerialNumber"),
        bluetooth_address:    extract_from(&info, "BluetoothAddress"),
        wifi_address:         extract_from(&info, "WiFiAddress"),
        fusing_status: fusing_raw,
        brick_state:   brick_raw.to_lowercase() == "true",
        password_protected: pwd_raw.to_lowercase() == "true" || pwd_raw == "1",
        phone_number:  extract_from(&info, "PhoneNumber"),
        udid:          extract_from(&info, "UniqueDeviceID"),
        biometric_status, als_status,
        storage_capacity, storage_used, storage_free,
        device_color, device_region,
        rear_camera_serial:   extract_from(&info, "RearFacingCameraModuleSerialNumber"),
        front_camera_serial:  extract_from(&info, "FrontFacingCameraModuleSerialNumber"),
        display_panel_serial: extract_from(&info, "CoverglassSerialNumber"),
        coverglass_serial:    extract_from(&info, "CoverglassSerialNumber"),
        savage_chip_id:       extract_from(&info, "SavageChipID"),
        savage_serial_number: extract_from(&info, "SavageSerialNumber"),
        wifi_mac_syscfg:      extract_from(&info, "WifiAddress"),
        bt_mac_syscfg:        extract_from(&info, "BluetoothAddress"),
        panic_full_count: 0,
        last_panic_reason: String::new(),
        nand_wear_level,
    })
}

fn empty_device() -> DeviceData {
    DeviceData {
        connected: false,
        device_name: "".into(), product_type: "".into(), ios_version: "".into(),
        imei: "".into(), mlb_serial: "".into(), chassis_serial: "".into(),
        icloud_locked: "".into(), icloud_account_masked: "".into(),
        battery_cycles: 0, battery_health: 0, battery_original: false,
        battery_serial: "".into(), battery_design_capacity: 0, battery_current_capacity: 0,
        bms_serial: "".into(), bms_nominal_capacity: 0, bms_voltage_mv: 0,
        bms_temperature_dc: 0, bms_instant_amperage: 0, bms_is_charging: false,
        bms_reset_count: 0, bms_flash_write_count: 0, bms_id_changed: false,
        model_number: "".into(), unknown_components: "".into(),
        activation_state: "".into(), baseband_status: "".into(), baseband_version: "".into(),
        wireless_board_serial: "".into(), bluetooth_address: "".into(), wifi_address: "".into(),
        fusing_status: "".into(), brick_state: false, password_protected: false,
        phone_number: "".into(), udid: "".into(),
        biometric_status: "".into(), als_status: "".into(),
        storage_capacity: "".into(), storage_used: "".into(), storage_free: "".into(),
        device_color: "".into(), device_region: "".into(),
        rear_camera_serial: "".into(), front_camera_serial: "".into(),
        display_panel_serial: "".into(), coverglass_serial: "".into(),
        savage_chip_id: "".into(), savage_serial_number: "".into(),
        wifi_mac_syscfg: "".into(), bt_mac_syscfg: "".into(),
        panic_full_count: 0, last_panic_reason: "".into(), nand_wear_level: 0.0,
    }
}


#[tauri::command]
async fn check_panic_logs(udid: String) -> u32 {
    let temp_dir = std::env::temp_dir().join("ireport_crashes");
    let _ = std::fs::remove_dir_all(&temp_dir);
    let _ = std::fs::create_dir_all(&temp_dir);

    let result = tokio::time::timeout(
        Duration::from_secs(20),
        Command::new("idevicecrashreport")
            .arg("-e").arg("-u").arg(&udid)
            .arg(temp_dir.to_string_lossy().as_ref())
            .output(),
    ).await;

    if result.is_err() { return 0; }
    let Ok(Ok(out)) = result else { return 0; };
    if !out.status.success() { return 0; }

    std::fs::read_dir(&temp_dir)
        .map(|entries| {
            entries.filter_map(Result::ok)
                .filter(|e| e.file_name().to_string_lossy().contains("panic-full"))
                .count() as u32
        })
        .unwrap_or(0)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![read_usb_device, check_panic_logs])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
