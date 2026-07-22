import { describe, it, expect } from "vitest";
import { getAppleModelName } from "../../src/utils/deviceMappings";

describe("deviceMappings", () => {
  describe("getAppleModelName", () => {
    it("traduz o product_type para o nome comercial do modelo", () => {
      expect(getAppleModelName("iPhone10,3")).toBe("iPhone X");
      expect(getAppleModelName("iPhone10,1")).toBe("iPhone 8");
    });

    it("retorna o próprio product_type quando não há mapeamento conhecido", () => {
      expect(getAppleModelName("iPhone99,9")).toBe("iPhone99,9");
    });
  });
});
