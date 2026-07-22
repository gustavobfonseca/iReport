import { invoke } from "@tauri-apps/api/core";
import { DeviceRawPayload } from "../types/device.types";

export const readUsbDevice = async (): Promise<DeviceRawPayload> => {
  return invoke<DeviceRawPayload>("read_usb_device");
};
