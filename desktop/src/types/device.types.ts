export interface DeviceRawPayload {
  connected: boolean;
  device_name: string;
  product_type: string;
  chassis_serial: string;
  udid: string;
  storage_capacity: string;
  storage_used: string;
  storage_free: string;
  brick_state: boolean;
  icloud_locked: string;
  icloud_account_masked: string;
  fusing_status: string;
  baseband_status: string;
  unknown_components: string;
  battery_health: number;
  battery_cycles: number;
  model_number: string;
  activation_state: string;
  biometric_status: string;
  als_status: string;
  bms_voltage_mv: number;
  bms_temperature_c: number;
  bms_instant_amperage: number;
}

export type InspectionStatus = "conforme" | "atencao" | "critico";

export interface InspectionField {
  label: string;
  status: InspectionStatus;
}

export interface DeviceUIModel {
  connected: boolean;
  device_name: string;
  product_type: string;
  serial_number: string;
  udid: string;
  storage_capacity: string;
  storage_used: string;
  storage_free: string;

  mdm: InspectionField;
  icloud: InspectionField;
  fusing: InspectionField;
  baseband: InspectionField;
  memory_crosscheck: InspectionField;

  parts_authenticity: InspectionField;
  battery_health: number;
  battery_cycles: number;
  battery_status: InspectionField;
  sim_configuration: InspectionField;
  carrier_lock: InspectionField;
  biometric: InspectionField;
  truetone: InspectionField;

  bms_telemetry_voltage: number;
  bms_telemetry_temp: number;
  bms_telemetry_amperage: number;
}
