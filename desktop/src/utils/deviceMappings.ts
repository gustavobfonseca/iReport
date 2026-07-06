import { RowStatus } from '../types/device';

export const getAppleModelName = (productType: string): string => {
  const mapping: { [key: string]: string } = {
    "iPhone10,1": "iPhone 8", "iPhone10,4": "iPhone 8",
    "iPhone10,2": "iPhone 8 Plus", "iPhone10,5": "iPhone 8 Plus",
    "iPhone10,3": "iPhone X", "iPhone10,6": "iPhone X",
    "iPhone11,2": "iPhone XS", "iPhone11,4": "iPhone XS Max",
    "iPhone11,6": "iPhone XS Max", "iPhone11,8": "iPhone XR",
    "iPhone12,1": "iPhone 11", "iPhone12,3": "iPhone 11 Pro",
    "iPhone12,5": "iPhone 11 Pro Max", "iPhone12,8": "iPhone SE (2nd Gen)",
    "iPhone13,1": "iPhone 12 mini", "iPhone13,2": "iPhone 12",
    "iPhone13,3": "iPhone 12 Pro", "iPhone13,4": "iPhone 12 Pro Max",
    "iPhone14,2": "iPhone 13 Pro", "iPhone14,3": "iPhone 13 Pro Max",
    "iPhone14,4": "iPhone 13 mini", "iPhone14,5": "iPhone 13",
    "iPhone14,6": "iPhone SE (3rd Gen)", "iPhone14,7": "iPhone 14",
    "iPhone14,8": "iPhone 14 Plus", "iPhone15,2": "iPhone 14 Pro",
    "iPhone15,3": "iPhone 14 Pro Max", "iPhone15,4": "iPhone 15",
    "iPhone15,5": "iPhone 15 Plus", "iPhone16,1": "iPhone 15 Pro",
    "iPhone16,2": "iPhone 15 Pro Max", "iPhone17,1": "iPhone 16 Pro",
    "iPhone17,2": "iPhone 16 Pro Max", "iPhone17,3": "iPhone 16",
    "iPhone17,4": "iPhone 16 Plus",
  };
  return mapping[productType] || productType;
};

export const getModelOrigin = (model: string) => {
  if (!model) return { letter: "?", label: "Desconhecido", description: "Não identificado.", status: "warning" as RowStatus };
  const letter = model.charAt(0).toUpperCase();
  switch (letter) {
    case "M": return { letter: "M", label: "Varejo — Produto Novo", description: "Canal mais seguro para compra e revenda.", status: "success" as RowStatus };
    case "F": return { letter: "F", label: "Recondicionado pela Apple", description: "Reparado e recertificado. Pode ter peças de reposição.", status: "warning" as RowStatus };
    case "N": return { letter: "N", label: "Reposição de Garantia", description: "Substituição de aparelho com defeito. Peças podem divergir.", status: "warning" as RowStatus };
    case "P": return { letter: "P", label: "Personalizado (Gravado)", description: "Produto de varejo com gravação. Equivalente ao canal M.", status: "success" as RowStatus };
    case "C": return { letter: "C", label: "Operadora (Carrier)", description: "Distribuído por operadora. Pode ter restrições de rede.", status: "warning" as RowStatus };
    case "D": return { letter: "D", label: "Unidade de Desenvolvimento", description: "NÃO deve estar no mercado de consumo.", status: "danger" as RowStatus };
    default:  return { letter, label: `Canal ${letter} — Desconhecido`, description: "Canal não mapeado. Verificar.", status: "warning" as RowStatus };
  }
};

export const expectedCapacityMap: { [key: string]: number } = {
  // iPhone X, XS, XR
  "iPhone10,3": 2716, "iPhone10,6": 2716,
  "iPhone11,2": 2658, "iPhone11,4": 3174, "iPhone11,6": 3174, "iPhone11,8": 2942,
  // iPhone 11
  "iPhone12,1": 3110, "iPhone12,3": 3046, "iPhone12,5": 3969, "iPhone12,8": 1821,
  // iPhone 12
  "iPhone13,1": 2227, "iPhone13,2": 2815, "iPhone13,3": 2815, "iPhone13,4": 3687,
  // iPhone 13
  "iPhone14,4": 2406, "iPhone14,5": 3227, "iPhone14,2": 3095, "iPhone14,3": 4352, "iPhone14,6": 2018,
  // iPhone 14
  "iPhone14,7": 3279, "iPhone14,8": 4325, "iPhone15,2": 3200, "iPhone15,3": 4323,
  // iPhone 15
  "iPhone15,4": 3349, "iPhone15,5": 4383, "iPhone16,1": 3274, "iPhone16,2": 4422,
  // iPhone 16
  "iPhone17,3": 3561, "iPhone17,4": 4685, "iPhone17,1": 3582, "iPhone17,2": 4685,
};

export const getRegionName = (regionCode: string): string => {
  if (!regionCode) return "Desconhecida";
  const code = regionCode.trim().toUpperCase();
  
  const mapping: { [key: string]: string } = {
    "BZ/A": "Brasil",
    "BR/A": "Brasil",
    "LZ/A": "América Latina",
    "PY/A": "América Latina",
    "LE/A": "América Latina",
    "MX/A": "América Latina",
    "LL/A": "Estados Unidos",
    "CL/A": "Canadá",
    "ZD/A": "Europa",
    "FD/A": "Europa",
    "B/A": "Europa",
    "T/A": "Europa",
    "Y/A": "Europa",
    "DN/A": "Europa",
    "QL/A": "Europa",
    "GP/A": "Europa",
    "J/A": "Ásia",
    "CH/A": "Ásia",
    "ZP/A": "Ásia",
    "KH/A": "Ásia",
    "X/A": "Oceania",
    "TA/A": "Ásia",
    "AE/A": "Oriente Médio",
    "AH/A": "Oriente Médio",
    "AB/A": "Oriente Médio",
  };

  const shortCode = code.split("/")[0];
  const shortMapping: { [key: string]: string } = {
    "BZ": "Brasil", "BR": "Brasil", "LZ": "América Latina", "PY": "América Latina",
    "MX": "América Latina", "LL": "Estados Unidos", "CL": "Canadá", "ZD": "Europa",
    "B": "Europa", "T": "Europa", "Y": "Europa", "J": "Ásia", "CH": "Ásia",
    "ZP": "Ásia", "KH": "Ásia", "X": "Oceania", "AE": "Oriente Médio",
  };

  return mapping[code] || shortMapping[shortCode] || `Outros (${code})`;
};

