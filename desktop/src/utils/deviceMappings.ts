import { specsManager } from "./specsManager";

export const getAppleModelName = (productType: string): string => {
  const specs = specsManager.getSpecs();
  return specs.models[productType] || productType;
};
