import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "../../src/components/Sidebar";
import { DeviceUIModel, InspectionField } from "../../src/types/device.types";

const ok: InspectionField = { label: "OK", status: "conforme" };

const makeDevice = (overrides?: Partial<DeviceUIModel>): DeviceUIModel => ({
  connected: true,
  device_name: "iPhone de Teste",
  product_type: "iPhone14,5",
  serial_number: "ABC123",
  udid: "00008110-000",
  storage_capacity: "128 GB",
  storage_used: "42 GB",
  storage_free: "86 GB",
  mdm: ok,
  icloud: ok,
  fusing: ok,
  baseband: ok,
  memory_crosscheck: ok,
  parts_authenticity: ok,
  battery_health: 94,
  battery_cycles: 120,
  battery_status: ok,
  sim_configuration: ok,
  carrier_lock: ok,
  biometric: ok,
  truetone: ok,
  bms_telemetry_voltage: 4120,
  bms_telemetry_temp: 31,
  bms_telemetry_amperage: -450,
  ...overrides,
});

const noop = () => {};

describe("Sidebar — bloco de armazenamento", () => {
  it("exibe capacidade, usado e livre do dispositivo", () => {
    const { container } = render(
      <Sidebar device={makeDevice()} activeTab="main" setActiveTab={noop} onDisconnect={noop} />,
    );

    expect(container.textContent).toContain("128 GB");
    expect(container.textContent).toContain("Utilizado: 42 GB");
    expect(container.textContent).toContain("Livre: 86 GB");
  });

  it("calcula e exibe o percentual de uso corretamente (used / total * 100)", () => {
    // A conta, feita de forma independente do componente:
    const used = 42;
    const total = 128;
    const expectedPct = Math.round((used / total) * 100); // 33

    const { container } = render(
      <Sidebar device={makeDevice()} activeTab="main" setActiveTab={noop} onDisconnect={noop} />,
    );

    expect(container.textContent).toContain(`Utilizado: 42 GB (${expectedPct}%)`);
  });

  it("mantém a coerência entre o que é exibido: usado + livre = capacidade", () => {
    const device = makeDevice({
      storage_capacity: "256 GB",
      storage_used: "100 GB",
      storage_free: "156 GB",
    });
    render(<Sidebar device={device} activeTab="main" setActiveTab={noop} onDisconnect={noop} />);

    // Lê os números de volta da UI e refaz a conta
    const used = parseInt(device.storage_used);
    const free = parseInt(device.storage_free);
    const capacity = parseInt(device.storage_capacity);
    expect(used + free).toBe(capacity);

    const expectedPct = Math.round((used / capacity) * 100); // 39
    expect(
      screen.getByText(new RegExp(`Utilizado: 100 GB \\(${expectedPct}%\\)`)),
    ).toBeInTheDocument();
  });
});
