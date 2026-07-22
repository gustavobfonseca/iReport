import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { SpecsManager } from "../../src/utils/specsManager";

describe("SpecsManager", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("getSpecs", () => {
    it("carrega as especificações padrão (specs_db.json) quando não há cache", () => {
      const manager = new SpecsManager();
      const specs = manager.getSpecs();

      expect(specs.models["iPhone10,3"]).toBe("iPhone X");
      expect(specs.modelPrefixes.M.label).toContain("Varejo");
      expect(specs.regions.exact["BR/A"]).toBe("Brasil");
    });
  });

  describe("carregamento do cache local", () => {
    it("usa as especificações do localStorage quando a estrutura é válida", () => {
      const cached = {
        models: { "iPhoneCustom,1": "iPhone Customizado" },
        modelPrefixes: { X: { label: "Canal X", description: "Teste" } },
        regions: { exact: {}, short: {} },
      };
      localStorage.setItem("ireport_specs", JSON.stringify(cached));

      const manager = new SpecsManager();

      expect(manager.getSpecs().models["iPhoneCustom,1"]).toBe("iPhone Customizado");
    });

    it("ignora o cache e mantém o padrão quando o JSON está malformado", () => {
      localStorage.setItem("ireport_specs", "{ isso não é json válido");

      const manager = new SpecsManager();

      expect(manager.getSpecs().models["iPhone10,3"]).toBe("iPhone X");
    });

    it("ignora o cache e mantém o padrão quando a estrutura não tem os campos exigidos", () => {
      localStorage.setItem("ireport_specs", JSON.stringify({ foo: "bar" }));

      const manager = new SpecsManager();

      expect(manager.getSpecs().models["iPhone10,3"]).toBe("iPhone X");
    });
  });

  describe("fetchUpdates", () => {
    it("atualiza as especificações e grava no cache quando a resposta é válida", async () => {
      const remoteSpecs = {
        models: { "iPhoneRemote,1": "iPhone Remoto" },
        modelPrefixes: {},
        regions: { exact: {}, short: {} },
      };
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(remoteSpecs),
        }),
      );

      const manager = new SpecsManager();
      await manager.fetchUpdates();

      expect(manager.getSpecs().models["iPhoneRemote,1"]).toBe("iPhone Remoto");
      expect(JSON.parse(localStorage.getItem("ireport_specs")!)).toEqual(remoteSpecs);
    });

    it("mantém as especificações atuais quando a chamada de rede falha", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));

      const manager = new SpecsManager();
      await expect(manager.fetchUpdates()).resolves.not.toThrow();

      expect(manager.getSpecs().models["iPhone10,3"]).toBe("iPhone X");
    });

    it("mantém as especificações atuais quando a resposta remota tem estrutura inválida", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ foo: "bar" }),
        }),
      );

      const manager = new SpecsManager();
      await manager.fetchUpdates();

      expect(manager.getSpecs().models["iPhone10,3"]).toBe("iPhone X");
      expect(localStorage.getItem("ireport_specs")).toBeNull();
    });
  });
});
