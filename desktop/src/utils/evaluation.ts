import { DeviceData, TableRow, DataRow, InspectionSummary, CriticalAlert } from '../types/device';
import { DeviceValidator } from './deviceValidator';
import { 
  Smartphone, ShieldCheck, RefreshCw, Lock, User, Key, Globe,
  Battery, Monitor, Sun, Radio, Fingerprint, Cpu, HardDrive
} from "lucide-react";

export const getInspectionSummary = (rows: TableRow[]): InspectionSummary => {
  let compliant = 0;
  let warnings = 0;
  let critical = 0;
  let unavailable = 0;
  const alerts: CriticalAlert[] = [];

  const dataRows = rows.filter((r): r is DataRow => 'result' in r);
  
  dataRows.forEach(row => {
    if (row.status === 'success') compliant++;
    else if (row.status === 'warning') warnings++;
    else if (row.status === 'danger') {
      critical++;
      alerts.push({ item: row.item, reason: row.result });
    }
    else if (row.status === 'info') unavailable++;
  });

  return {
    totalChecks: dataRows.length,
    compliant,
    warnings,
    critical,
    unavailable,
    alerts
  };
};

export const getBatteryVeredict = (device: DeviceData | null) => {
  if (!device) return { label: "Não disponível", colorClass: "text-[#8c93a6]" };
  const isBatteryUnpaired = device.unknown_components.toLowerCase().includes("battery");
  const expectedHealthByCycles = Math.max(0, 100 - (device.battery_cycles / 500) * 20);
  const isCyclesMaquiagem = device.battery_cycles > 30 && (device.battery_health - expectedHealthByCycles) > 25;
  const health = device.battery_design_capacity > 0 
    ? Math.round((device.bms_nominal_capacity / device.battery_design_capacity) * 100)
    : device.battery_health;

  if (isBatteryUnpaired) return { label: "Atenção", colorClass: "text-amber-400" };
  if (isCyclesMaquiagem) return { label: "Crítico", colorClass: "text-red-400 font-bold" };

  // Regra Oficial Apple:
  // Modelos antigos mantêm capacidade até 500 ciclos. Modelos novos (iPhone 15 e posteriores) mantêm até 1000 ciclos.
  const product = device.product_type.toLowerCase();
  const isNewModel = product.includes("iphone15") || product.includes("iphone16") || product.includes("iphone17");
  const maxCycles = isNewModel ? 1000 : 500;

  if (health >= 80 && device.battery_cycles < maxCycles) {
    return { label: "Conforme", colorClass: "text-emerald-400 font-semibold" };
  } else if (health >= 80 && device.battery_cycles >= maxCycles) {
    // Ultrapassou a vida útil de ciclos mas mantém a saúde física/química acima do limite
    return { label: "Atenção", colorClass: "text-amber-400 font-semibold" };
  }
  
  // Saúde abaixo de 80% (Apple recomenda troca imediata)
  return { label: "Crítico", colorClass: "text-red-400 font-bold" };
};

export const buildRows = (device: DeviceData | null, _panicLogs: number | null): TableRow[] => {
  if (!device) return [];
  const val = new DeviceValidator(device);

  return [
    { section: "Segurança e Contas" },
    {
      item: "iCloud / Find My",
      icon: Lock,
      ...val.validateICloud()
    },
    {
      item: "Conta Apple ID Vinculada",
      icon: User,
      ...val.validateAppleID()
    },
    {
      item: "Código de Desbloqueio (Senha)",
      icon: Key,
      ...val.validatePasscode()
    },
    {
      item: "Bloqueio Corporativo (MDM)",
      icon: Lock,
      ...val.validateMDM()
    },

    { section: "Informações do Aparelho" },
    {
      item: "Categoria Apple",
      icon: Globe,
      ...val.validateAppleCategory()
    },
    {
      item: "Status de Ativação",
      icon: Smartphone,
      ...val.validateActivationState()
    },
    {
      item: "Origem do Aparelho",
      icon: Globe,
      ...val.validateOrigin()
    },

    { section: "Condição da Bateria" },
    {
      item: "Saúde da Bateria",
      icon: Battery,
      ...val.validateBatteryHealth()
    },
    {
      item: "Ciclos de Carga",
      icon: RefreshCw,
      ...val.validateBatteryCycles()
    },
    {
      item: "Resets de Telemetria (BMS)",
      icon: RefreshCw,
      ...val.validateBmsResets()
    },
    {
      item: "Bateria Original",
      icon: Cpu,
      ...val.validateBatteryOriginality()
    },

    { section: "Componentes e Peças" },
    {
      item: "Originalidade da Tela",
      icon: Monitor,
      ...val.validateDisplayOriginality()
    },
    {
      item: "Modem de Rede (Baseband)",
      icon: Radio,
      ...val.validateBaseband()
    },
    {
      item: "Estabilidade do Sistema (Travamentos)",
      icon: ShieldCheck,
      ...val.validateSystemStability()
    },
    {
      item: "Funcionamento do Biométrico",
      icon: Fingerprint,
      ...val.validateBiometric()
    },
    {
      item: "Sensor de Luz (TrueTone)",
      icon: Sun,
      ...val.validateTrueTone()
    },
    {
      item: "Saúde do Armazenamento",
      icon: HardDrive,
      ...val.validateStorageWear()
    },
  ];
};
