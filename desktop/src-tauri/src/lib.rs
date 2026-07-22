mod models;
mod utils;
mod commands;

use tauri::Emitter;
use serde::Serialize;
use tokio::time::{sleep, Duration};

#[derive(Clone, Serialize)]
struct TelemetryPayload {
    voltage: u32,
    temp: f32,
    amperage: i32,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                loop {
                    // Não concorre com um scan em andamento: sessões lockdown /
                    // diagnostics simultâneas no mesmo device costumam falhar e
                    // são a causa clássica de "às vezes não conecta".
                    if commands::is_scanning() {
                        sleep(Duration::from_millis(500)).await;
                        continue;
                    }

                    let mut cmd = tokio::process::Command::new("idevicediagnostics");
                    cmd.arg("ioregentry").arg("AppleSmartBattery");

                    let mut alive = false;
                    if let Some(d) = utils::run_cmd(cmd).await {
                        let voltage = utils::extract_plist_int(&d, "Voltage");
                        let amperage = utils::extract_plist_int_signed(&d, "InstantAmperage");
                        let temp_c = utils::extract_plist_int_signed(&d, "Temperature") as f32 / 10.0;

                        // voltage 0 = sem leitura válida (dispositivo desconectado ou não respondeu)
                        if voltage > 0 {
                            alive = true;
                            let payload = TelemetryPayload {
                                voltage,
                                temp: temp_c,
                                amperage,
                            };
                            let _ = app_handle.emit("telemetry_update", payload);
                        }
                    }

                    // Com device: telemetria viva (1s). Ocioso: backoff para 3s —
                    // menos pressão no usbmux e menos interferência na hora de plugar.
                    sleep(Duration::from_secs(if alive { 1 } else { 3 })).await;
                }
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::read_usb_device
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
