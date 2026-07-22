export const TOOLTIPS_DICTIONARY = {
  kpis: {
    bateria:
      "Cruza os dados reais do chip da bateria com a capacidade de fábrica. Ciclos indicam o desgaste real pelo uso contínuo.",
    integridade:
      "Garante que o aparelho não possui bloqueios corporativos (MDM) e que o núcleo do sistema (SecureROM/Fusing) não foi hackeado ou adulterado.",
    autenticidade:
      "Verifica o histórico criptográfico oficial da Apple para identificar se Tela, Bateria ou Câmera foram substituídas por peças não genuínas.",
  },
  dealbreakers: {
    mdm: "Verifica perfis de gerenciamento remoto. Se bloqueado, o aparelho pertence a uma empresa e pode ser inutilizado à distância a qualquer momento.",
    icloud:
      "Verifica se há sessão do Apple ID ativa ou Find My ligado. Exige que o dono anterior remova a conta para evitar bloqueio de ativação pós-formatação.",
    fusing:
      "Audita a integridade física do processador (SecureROM). Alterações indicam tentativa profunda de mascarar defeitos da placa-mãe.",
    baseband:
      "Valida o firmware do modem celular. Falhas de comunicação aqui indicam danos severos na placa que impedem o aparelho de dar área/sinal.",
    memoria:
      "Cruza a SKU comercial do aparelho com o tamanho real da partição APFS, detectando fraudes de aumento falso de armazenamento na NAND.",
  },
  precificacao: {
    pecas:
      "Lê o log do iOS 15.2+ para confirmar a assinatura criptográfica dos componentes vitais. Peças paralelas reduzem drasticamente o valor de revenda.",
    sim: "Confirma a arquitetura física da placa. Modelos americanos recentes possuem apenas eSIM, o que pode gerar atrito no mercado nacional.",
    operadora:
      "Verifica o Carrier Bundle. Garante que o aparelho aceita chips de operadoras locais e não está atrelado a contratos estrangeiros.",
    biometria:
      "Comprova a comunicação criptográfica do Secure Enclave com o módulo original do FaceID ou TouchID. Falhas indicam que a biometria nunca mais funcionará.",
    truetone:
      "Testa a comunicação com o Sensor de Luz Ambiente (ALS). A ausência indica tela trocada sem reprogramação da EEPROM original.",
  },
  ruido: {
    bms_voltage:
      "Mede a tensão instantânea da bateria enviada pelo circuito integrado de controle (BMS).",
    bms_amperage: "Mede a corrente elétrica instantânea de consumo ou recarga em tempo real.",
    bms_temp: "Temperatura interna da célula de bateria extraída do sensor térmico do BMS.",
  },
};
