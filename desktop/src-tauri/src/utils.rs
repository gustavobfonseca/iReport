use tokio::process::Command;
use tokio::time::{timeout, Duration};

/// Localiza uma linha iniciada por uma chave e extrai o valor após os dois pontos `:`
pub fn extract_from(stdout: &str, key: &str) -> String {
    stdout.lines()
        .find(|line| line.trim_start().starts_with(key))
        .and_then(|line| line.split_once(':'))
        .map(|(_, value)| value)
        .unwrap_or("N/A")
        .trim()
        .to_string()
}

/// Extrai o valor inteiro contido na tag <integer> que suceda a tag <key> correspondente
pub fn extract_plist_int(stdout: &str, key: &str) -> u32 {
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

/// Extrai o valor inteiro com sinal (assinado) contido na tag <integer> que suceda a tag <key>
pub fn extract_plist_int_signed(stdout: &str, key: &str) -> i32 {
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

/// Executa um Command async com timeout. Retorna `None` se o processo travar ou falhar.
pub async fn run_cmd(mut cmd: Command) -> Option<String> {
    match timeout(Duration::from_secs(5), cmd.output()).await {
        Ok(Ok(out)) if out.status.success() => {
            Some(String::from_utf8_lossy(&out.stdout).into_owned())
        }
        _ => None,
    }
}

/// Abstrai "rodar um binário de sistema e ler o stdout" para que a lógica de
/// orquestração em `commands.rs` seja testável com saída fixa (fixtures),
/// sem depender de um iPhone real conectado.
pub trait DeviceCommandRunner {
    async fn run(&self, program: &str, args: &[&str]) -> Option<String>;
}

/// Implementação real: shelling out para os binários do libimobiledevice.
pub struct RealCommandRunner;

impl DeviceCommandRunner for RealCommandRunner {
    async fn run(&self, program: &str, args: &[&str]) -> Option<String> {
        let mut cmd = Command::new(program);
        cmd.args(args);
        run_cmd(cmd).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extract_from_finds_value_after_colon() {
        let stdout = "DeviceName: iPhone de Gustavo\nProductType: iPhone14,5\n";
        assert_eq!(extract_from(stdout, "DeviceName"), "iPhone de Gustavo");
        assert_eq!(extract_from(stdout, "ProductType"), "iPhone14,5");
    }

    #[test]
    fn extract_from_returns_na_when_key_is_missing() {
        let stdout = "DeviceName: iPhone\n";
        assert_eq!(extract_from(stdout, "SerialNumber"), "N/A");
    }

    #[test]
    fn extract_plist_int_reads_value_after_key() {
        let stdout = "<key>Voltage</key>\n<integer>4120</integer>\n";
        assert_eq!(extract_plist_int(stdout, "Voltage"), 4120);
    }

    #[test]
    fn extract_plist_int_returns_zero_when_key_is_missing() {
        assert_eq!(extract_plist_int("<key>Other</key>\n<integer>1</integer>\n", "Voltage"), 0);
    }

    #[test]
    fn extract_plist_int_signed_reads_negative_values() {
        let stdout = "<key>InstantAmperage</key>\n<integer>-450</integer>\n";
        assert_eq!(extract_plist_int_signed(stdout, "InstantAmperage"), -450);
    }

}
