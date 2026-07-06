import { useState, useEffect } from "react";
import { DeviceData } from "../types/device";
import { readUsbDevice, checkPanicLogs } from "../services/deviceService";

export const useDeviceScanner = () => {
  const [device, setDevice] = useState<DeviceData | null>(null);
  const [scanning, setScanning] = useState(false);
  const [panicLogs, setPanicLogs] = useState<number | null>(null);

  const scanDevice = async () => {
    setScanning(true);
    try {
      const data = await readUsbDevice();
      if (data.connected) setDevice(data);
      else { 
        setDevice(null); 
        setPanicLogs(null); 
      }
    } catch { 
      setDevice(null); 
      setPanicLogs(null); 
    }
    finally { setTimeout(() => setScanning(false), 200); }
  };

  useEffect(() => {
    const interval = setInterval(scanDevice, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (device?.udid) {
      setPanicLogs(null);
      checkPanicLogs(device.udid)
        .then((count) => setPanicLogs(count))
        .catch(console.error);
    }
  }, [device?.udid]);

  const clearDevice = () => {
    setDevice(null);
  };

  return {
    device,
    scanning,
    panicLogs,
    scanDevice,
    clearDevice
  };
};
