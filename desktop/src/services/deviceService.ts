import { invoke } from "@tauri-apps/api/core";
import { DeviceData } from "../types/device";

export const readUsbDevice = async (): Promise<DeviceData> => {
  return invoke<DeviceData>("read_usb_device");
};

export const checkPanicLogs = async (udid: string): Promise<number> => {
  return invoke<number>("check_panic_logs", { udid });
};
