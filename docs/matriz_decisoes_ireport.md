# Matriz de Decisões e Lógica de Negócio (iReport)

Este documento especifica a inteligência do sistema do **iReport.app**, mostrando a relação direta entre o dado bruto extraído do hardware do iPhone/iPad e a conclusão comercial/técnica que o software gera no laudo.

---

## 1. Mapeamento de Extração e Conclusões

O iReportScanner executa a lógica de tradução de dados brutos dividida em três categorias principais de auditoria:

### 🔋 Categoria 1: Bateria (Saúde, Desgaste e Fraudes)

| Chaves Coletadas (Raw Data) | Condição Identificada | Conclusão Técnica | Tradução para o Lojista / Cliente |
| :--- | :--- | :--- | :--- |
| `CycleCount` < 300 | Baixo uso da bateria | Bateria nova ou seminova | **Excelente (Pouco Uso)** |
| `CycleCount` 300 a 500 | Uso moderado padrão | Vida útil dentro do normal | **Normal (Bom Estado)** |
| `CycleCount` > 500 | Alta contagem de recargas | Fim da vida útil recomendado | **Desgastada (Troca Recomendada)** |
| `health_percentage` >= 85% | Excelente retenção de mAh | Células químicas saudáveis | **Saudável (Ótima Retenção)** |
| `health_percentage` 80% a 84% | Retenção moderada | Células em desgaste | **Atenção (Desgaste Moderado)** |
| `health_percentage` < 80% | Retenção crítica de carga | Bateria degradada quimicamente | **Degradada (Substituição Urgente)** |
| `Serial` == "N/A" ou vazio ou "0000..." | Sem assinatura de fábrica | Bateria paralela/chinesa | **⚠️ Alerta: Peça Paralela / Modificada** |
| `Serial` atual != `Serial` do 1º Scan | Mudança de identificador | Substituição de peça física | **Bateria Substituída (Sem histórico de falha)** |
| `health_percentage` < 80% E dados do iOS alegam 100% | Incongruência lógica de dados | **Bateria Maquiada (JC Board)** | **🚨 Alerta de Fraude: Bateria reprogramada artificialmente** |

---

### 📱 Categoria 2: Tela e Sensores (Autenticidade e Transplantes)

| Chaves Coletadas (Raw Data) | Condição Identificada | Conclusão Técnica | Tradução para o Lojista / Cliente |
| :--- | :--- | :--- | :--- |
| `DisplaySerial` válido E condiz com lote MLB | Assinatura original batendo | Tela original de fábrica | **Original Apple (Verificado)** |
| `DisplaySerial` == "N/A" ou `UnknownComponents` contendo "Display" | Sem pareamento ou chip paralelo | Tela paralela sem chip pareado | **⚠️ Alerta: Tela Paralela / Não Original** |
| `TrueToneStatus` == `Inactive` E tela é original | Ausência de True Tone | Troca de tela sem transplante de EEPROM | **True Tone Ausente (Possível reparo anterior)** |
| `DisplaySerial` atual != `DisplaySerial` 1º Scan | Mudança de identificador | Tela substituída | **Tela Substituída (Aparelho com histórico de reparo)** |

---

### 🔒 Categoria 3: Segurança, Procedência e Bloqueios

| Chaves Coletadas (Raw Data) | Condição Identificada | Conclusão Técnica | Tradução para o Lojista / Cliente |
| :--- | :--- | :--- | :--- |
| `fm-activation-locked` == `WUVT` / `YES` | Find My iPhone ligado na nuvem | iCloud vinculado à conta ativa | **🚨 Bloqueado: iCloud Ativado (Risco de Bloqueio)** |
| `fm-activation-locked` == `NO` | Aparelho desvinculado | Pronto para nova formatação | **Livre / Pronto para Uso** |
| `IMEI` USB != `IMEI` gravado na carcaça/gaveta | Placa não condiz com carcaça | **Aparelho Frankenstein / Carcaça Trocada** | **🚨 Alerta: Carcaça / Chassis não condiz com a placa-mãe** |
| `BasebandStatus` == `Unresponsive` ou sem serial | Falha de sinal de operadora | Chip de baseband danificado ou impedido | **⚠️ Falha de Sinal (Sem IMEI/Sem Serviço)** |

---

## 2. Detalhe Técnico: Como Pegamos a Fraude de Bateria Maquiada?

A maquiagem de bateria é o golpe mais comum na compra de iPhones usados. O golpista conecta o iPhone em uma placa gravadora (ex: *JC ID V1S Pro*), escreve no chip que a saúde é `100%` e zera a contagem de ciclos.
O iReport mata essa fraude cruzando **dois dados** obtidos de domínios diferentes da Apple:

1. **A Capacidade Química Real (`AppleRawMaxCapacity`):**
   * A gravadora altera a informação estática exibida no menu do iOS, mas **não consegue alterar a capacidade física de retenção química** medida dinamicamente pelo circuito interno da bateria.
   * O iReport lê a capacidade química física em mAh em tempo real. Se o iPhone é um modelo 11 (Capacidade nominal 3110 mAh) e o chip está lendo fisicamente `2200 mAh`, a saúde real é **70.7%**. Se o iOS exibe 100%, o sistema gera o alerta imediato de maquiagem.
2. **O Serial do Componente (`Serial`):**
   * Para burlar a mensagem de "Peça Desconhecida" do iOS 15.2+, muitos técnicos usam chips flex chineses que clonam dados. Porém, esses chips falham ao responder à verificação criptográfica de chave pública da placa-mãe (MLB).
   * O iReport detecta que a assinatura serial retornada é inválida ou estática (`N/A` ou `00000`), apontando que aquela bateria não é a mesma homologada de fábrica.
