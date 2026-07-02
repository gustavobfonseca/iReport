#!/usr/bin/env python3
import subprocess
import plistlib
import json
import os
import sys

# Cores para formatação de terminal
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
BOLD = "\033[1m"
RESET = "\033[0m"

def run_command(command):
    """Executa um comando no terminal e retorna a saída em string/bytes."""
    try:
        result = subprocess.run(command, capture_output=True)
        if result.returncode != 0:
            return None
        return result.stdout
    except FileNotFoundError:
        return None

def check_dependencies():
    """Verifica se as ferramentas da libimobiledevice estão instaladas no sistema."""
    ideviceinfo_check = run_command(["which", "ideviceinfo"])
    diagnostics_check = run_command(["which", "idevicediagnostics"])
    
    if not ideviceinfo_check or not diagnostics_check:
        print(f"{RED}{BOLD}Erro:{RESET} libimobiledevice não foi encontrada no sistema.")
        print(f"Por favor, certifique-se de que rodou: {YELLOW}brew install libimobiledevice{RESET} no seu Mac.")
        sys.exit(1)

def get_device_info():
    """Coleta informações gerais de identificação e segurança do iPhone."""
    raw_data = run_command(["ideviceinfo"])
    if not raw_data:
        return None
    
    lines = raw_data.decode("utf-8", errors="ignore").splitlines()
    info = {}
    for line in lines:
        if ":" in line:
            parts = line.split(":", 1)
            key = parts[0].strip()
            val = parts[1].strip()
            info[key] = val
    return info

def get_battery_info():
    """Coleta e decodifica as informações detalhadas da bateria via IORegistry."""
    raw_xml = run_command(["idevicediagnostics", "ioregentry", "AppleSmartBattery"])
    if not raw_xml:
        return None
    
    try:
        # Decodifica o XML do plist retornado pela Apple
        plist_data = plistlib.loads(raw_xml)
        # O ioregentry retorna um dicionário sob a chave 'IORegistry'
        return plist_data.get("IORegistry", {})
    except Exception as e:
        print(f"{RED}Erro ao parsear Plist da Bateria: {e}{RESET}")
        return None

def main():
    print(f"{BLUE}{BOLD}=== iReport | Iniciando Vistoria Cautelar via USB ==={RESET}\n")
    
    # 1. Verifica ambiente
    check_dependencies()
    
    # 2. Coleta dados gerais
    print("Conectando ao dispositivo...")
    device_info = get_device_info()
    if not device_info:
        print(f"{RED}{BOLD}Erro:{RESET} Nenhum iPhone detectado via USB. Verifique se o cabo está conectado e se clicou em 'Confiar' na tela do celular.")
        sys.exit(1)
    
    # 3. Coleta dados de bateria
    battery_info = get_battery_info()
    if not battery_info:
        print(f"{RED}{BOLD}Erro:{RESET} Falha ao ler dados de diagnóstico da bateria. O celular está desbloqueado?")
        sys.exit(1)
        
    # 4. Extração de variáveis chaves
    device_name = device_info.get("DeviceName", "iPhone Desconhecido")
    product_version = device_info.get("ProductVersion", "iOS Desconhecido")
    product_type = device_info.get("ProductType", "Desconhecido")
    imei = device_info.get("InternationalMobileEquipmentIdentity", "N/A")
    mlb_serial = device_info.get("MLBSerialNumber", "N/A")
    
    # Validação do iCloud
    icloud_locked_raw = device_info.get("fm-activation-locked", "NO")
    icloud_status = "LIVRE / DESATIVADO"
    if icloud_locked_raw == "WUVT" or icloud_locked_raw.upper() == "YES":
        icloud_status = "BLOQUEADO (ATIVADO)"
    
    # Variáveis da Bateria
    # Tenta ler do nó interno "BatteryData" ou da raiz do plist
    battery_data = battery_info.get("BatteryData", {})
    cycles = battery_info.get("CycleCount", battery_data.get("CycleCount", "N/A"))
    design_capacity = battery_info.get("DesignCapacity", battery_data.get("DesignCapacity", "N/A"))
    raw_max_capacity = battery_info.get("AppleRawMaxCapacity", battery_data.get("AppleRawMaxCapacity", "N/A"))
    battery_serial = battery_info.get("Serial", battery_data.get("Serial", "N/A"))
    
    # Traduz contagem de ciclos para texto amigável
    cycles_status = "N/A"
    if isinstance(cycles, int):
        if cycles < 300:
            cycles_status = "Excelente (Pouco Uso)"
        elif cycles <= 500:
            cycles_status = "Normal (Bom Estado)"
        else:
            cycles_status = "Desgastada (Substituição recomendada)"
            
    # Traduz saúde da bateria para texto amigável
    health_status = "N/A"
    if health_percentage != "N/A":
        if health_percentage >= 85:
            health_status = "Saudável (Ótima Retenção)"
        elif health_percentage >= 80:
            health_status = "Atenção (Desgaste Moderado)"
        else:
            health_status = "Degradada (Substituição Urgente)"
            
    # Traduz originalidade da bateria
    is_original_battery = not (battery_serial == "N/A" or not battery_serial or "0000000" in str(battery_serial))
    battery_originality_translated = f"{GREEN}Original Apple (Verificado){RESET}" if is_original_battery else f"{RED}⚠️ Alerta: Peça Paralela / Modificada{RESET}"

    # 5. Renderização do Laudo Cautelar
    print(f"\n{GREEN}{BOLD}✔ Laudo Gerado com Sucesso!{RESET}\n")
    print(f"{BOLD}-------------------------------------------------------{RESET}")
    print(f"  {BLUE}{BOLD}LAUDO CAUTELAR DE DISPOSITIVO{RESET}")
    print(f"{BOLD}-------------------------------------------------------{RESET}")
    print(f"  Dispositivo:    {BOLD}{device_name}{RESET} ({product_type})")
    print(f"  Sistema:        iOS {product_version}")
    print(f"  IMEI principal: {imei}")
    print(f"  Serial Placa:   {mlb_serial}")
    print(f"  iCloud status:  {GREEN if 'LIVRE' in icloud_status else RED}{icloud_status}{RESET}")
    print(f"{BOLD}-------------------------------------------------------{RESET}")
    print(f"  {BLUE}{BOLD}STATUS DA BATERIA (AUDITORIA FÍSICA){RESET}")
    print(f"{BOLD}-------------------------------------------------------{RESET}")
    print(f"  Contagem de Ciclos:   {BOLD}{cycles} ciclos{RESET} ({cycles_status})")
    print(f"  Capacidade Nominal:   {design_capacity} mAh")
    print(f"  Retenção Atual:       {raw_max_capacity} mAh")
    
    if health_percentage != "N/A":
        color_health = GREEN if health_percentage >= 80 else YELLOW if health_percentage >= 70 else RED
        print(f"  Saúde Química Real:   {color_health}{health_percentage}%{RESET} ({health_status})")
    else:
        print(f"  Saúde Química Real:   N/A")
        
    print(f"  Serial da Bateria:    {battery_serial}")
    print(f"  Originalidade Bateria: {battery_originality_translated}")
    print(f"{BOLD}-------------------------------------------------------{RESET}")
    
    # 6. Salvar log em outputs/ e gerar laudo_ativo.js para espelhamento web
    output_dir = "outputs"
    os.makedirs(output_dir, exist_ok=True)
    
    report_data = {
        "device": {
            "name": device_name,
            "type": product_type,
            "ios_version": product_version,
            "imei": imei,
            "mlb_serial": mlb_serial,
            "icloud_locked": icloud_status
        },
        "battery": {
            "cycles": cycles,
            "cycles_status": cycles_status,
            "design_capacity": design_capacity,
            "current_max_capacity": raw_max_capacity,
            "health_percentage": health_percentage,
            "health_status": health_status,
            "serial": battery_serial,
            "original": is_original_battery,
            "original_status": "Original" if is_original_battery else "Não Original"
        },
        "inspection_timestamp": device_info.get("TimeIntervalSince1970", "N/A")
    }
    
    # Salva o JSON bruto
    report_filename = os.path.join(output_dir, f"laudo_{imei}.json")
    with open(report_filename, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=4, ensure_ascii=False)
        
    # Gera o arquivo JS de sincronização local para burlar o CORS do browser
    js_sync_content = f"window.dadosLaudo = {json.dumps(report_data, indent=4, ensure_ascii=False)};"
    with open("laudo_ativo.js", "w", encoding="utf-8") as f:
        f.write(js_sync_content)
        
    print(f"\nLaudo salvo em formato JSON em: {YELLOW}{report_filename}{RESET}")
    print(f"Dados espelhados localmente em: {YELLOW}laudo_ativo.js{RESET}")
    
    # 7. Abre o navegador automaticamente no index.html local
    try:
        import webbrowser
        html_path = os.path.abspath("index.html")
        webbrowser.open(f"file://{html_path}")
        print(f"\n{GREEN}{BOLD}Concluído! O navegador foi aberto para exibir o laudo.{RESET}")
    except Exception as e:
        print(f"\n{YELLOW}Leitura concluída, mas não foi possível abrir o navegador automaticamente: {e}{RESET}")

if __name__ == "__main__":
    main()
