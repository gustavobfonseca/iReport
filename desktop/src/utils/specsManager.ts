import defaultSpecs from "./specs_db.json";

export interface SpecModelPrefix {
  label: string;
  description: string;
}

export interface SpecRegions {
  exact: { [key: string]: string };
  short: { [key: string]: string };
}

export interface HardwareSpecs {
  models: { [key: string]: string };
  modelPrefixes: { [key: string]: SpecModelPrefix };
  regions: SpecRegions;
}

export class SpecsManager {
  private activeSpecs: HardwareSpecs;

  constructor() {
    this.activeSpecs = defaultSpecs as HardwareSpecs;
    this.loadFromCache();
  }

  private loadFromCache() {
    if (typeof window === "undefined") return;
    try {
      const cached = localStorage.getItem("ireport_specs");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (this.isValidSpecs(parsed)) {
          this.activeSpecs = parsed;
        }
      }
    } catch (e) {
      console.error("Falha ao ler especificações do cache local:", e);
    }
  }

  private isValidSpecs(obj: unknown): obj is HardwareSpecs {
    if (!obj || typeof obj !== "object") return false;
    const candidate = obj as Record<string, unknown>;
    const regions = candidate.regions as Record<string, unknown> | undefined;
    return (
      typeof candidate.models === "object" &&
      candidate.models !== null &&
      typeof candidate.modelPrefixes === "object" &&
      candidate.modelPrefixes !== null &&
      typeof regions === "object" &&
      regions !== null &&
      typeof regions.exact === "object" &&
      regions.exact !== null &&
      typeof regions.short === "object" &&
      regions.short !== null
    );
  }

  public getSpecs(): HardwareSpecs {
    return this.activeSpecs;
  }

  public async fetchUpdates(): Promise<void> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/api/specs`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        throw new Error(`HTTP status ${res.status}`);
      }

      const data = await res.json();
      if (this.isValidSpecs(data)) {
        this.activeSpecs = data;
        localStorage.setItem("ireport_specs", JSON.stringify(data));
      } else {
        console.warn("JSON recebido da nuvem contém estrutura inválida de especificações.");
      }
    } catch (err) {
      console.warn(
        "Não foi possível atualizar as especificações da nuvem. Usando versão local/cacheada.",
        err,
      );
    }
  }
}

export const specsManager = new SpecsManager();
