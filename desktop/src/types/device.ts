export interface DeviceData {
  connected: boolean;
  device_name: string;
  product_type: string;
  ios_version: string;
  imei: string;
  mlb_serial: string;
  chassis_serial: string;
  icloud_locked: string;
  icloud_account_masked: string;
  battery_cycles: number;
  battery_health: number;
  battery_original: boolean;
  battery_serial: string;
  battery_design_capacity: number;
  battery_current_capacity: number;
  bms_serial: string;
  bms_nominal_capacity: number;
  bms_voltage_mv: number;
  bms_temperature_dc: number;
  bms_instant_amperage: number;
  bms_is_charging: boolean;
  bms_reset_count: number;
  bms_flash_write_count: number;
  bms_id_changed: boolean;
  model_number: string;
  unknown_components: string;
  activation_state: string;
  baseband_status: string;
  baseband_version: string;
  wireless_board_serial: string;
  bluetooth_address: string;
  wifi_address: string;
  fusing_status: string;
  brick_state: boolean;
  password_protected: boolean;
  phone_number: string;
  udid: string;
  biometric_status: string;
  als_status: string;
  storage_capacity: string;
  storage_used: string;
  storage_free: string;
  device_color: string;
  device_region: string;
  rear_camera_serial: string;
  front_camera_serial: string;
  display_panel_serial: string;
  coverglass_serial: string;
  savage_chip_id: string;
  savage_serial_number: string;
  wifi_mac_syscfg: string;
  bt_mac_syscfg: string;
  panic_full_count: number;
  last_panic_reason: string;
  nand_wear_level: number;
}

export type RowStatus = "success" | "warning" | "danger" | "info";

export interface DataRow {
  item: string;
  icon: any;
  read: string;
  result: string;
  status: RowStatus;
  note?: string;
}

export interface CriticalAlert {
  item: string;
  reason: string;
}

export interface InspectionSummary {
  totalChecks: number;
  compliant: number;
  warnings: number;
  critical: number;
  unavailable: number;
  alerts: CriticalAlert[];
}

export interface SectionRow {
  section: string;
}

export type TableRow = DataRow | SectionRow;
