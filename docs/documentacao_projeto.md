# Documentação do Projeto: iReport.app (Laudo Cautelar para iPhones e iPads)

Esta documentação serve como especificação técnica, plano de negócios e arquitetura de produto para a plataforma **iReport.app**, estruturada como um caso de estudo comercializável e focado em valor real.

---

## 1. Visão Geral e Resumo Executivo

O **iReport.app** é um ecossistema de vistoria técnica independente e laudo cautelar para **iPhones e iPads** seminovos. O produto elimina a desconfiança e o medo de golpes na compra e venda de aparelhos Apple usados.

* **O Nome (iReport.app):** O nome "iReport" traz um tom internacional, limpo e direto. Vincula o "i" (Apple) com "Report" (relatório/laudo de conformidade), traduzindo perfeitamente a entrega de um relatório técnico de confiança.
* **Foco Inicial B2B:** Lojas de seminovos, assistências técnicas e quiosques de troca (*trade-in*) que compram aparelhos de clientes para dar desconto na venda de novos.
* **O Core do Produto (Confiança e Prevenção):**
  * **Para a Compra (Lojista):** Um aplicativo desktop que avalia a integridade do hardware via cabo USB em 60 segundos, blindando a margem da loja contra aparelhos maquiados.
  * **Para a Venda (Consumidor):** Um QR Code gerado pelo sistema para ser compartilhado digitalmente. Ao escanear, o comprador abre uma página pública independente provando a saúde real e a originalidade das peças.

---

## 2. A Dor de Mercado (O Problema)

O mercado de smartphones e tablets seminovos movimentou bilhões nos últimos anos, mas enfrenta quatro gargalos graves:

1. **Aparelhos Maquiados (Fraude de Trade-in):** Golpistas utilizam reprogramadores de chip (como a *JC V1S*) para alterar o contador de desgaste físico da bateria e forçar o iOS a exibir "100% de Saúde" nos Ajustes. Lojistas desavisados aceitam esses aparelhos no balcão e tomam prejuízo com reparos posteriores.
2. **Cegueira Técnica no iPad:** Ao contrário do iPhone, a Apple oculta a contagem de ciclos e saúde da bateria nas configurações nativas do iPadOS. Avaliar um iPad usado no balcão sem ferramentas USB é uma compra no escuro.
3. **Alto Custo de Devoluções e Garantia:** Lojas de seminovos são obrigadas por lei a dar 90 dias de garantia. A compra de aparelhos com peças paralelas ocultas faz a taxa de retorno por assistência explodir, destruindo o lucro operacional da loja.
4. **Desconfiança na Venda (Falta de Credibilidade):** O consumidor final tem medo de cair em golpes (aparelhos com telas trocadas por réplicas ruins ou iCloud bloqueado). Prints e fotos do sistema do aparelho são fáceis de editar no Photoshop, perdendo valor como prova social.

### 2.1 Volume de Mercado e Validação da Dor (Fatos e Números)
* **Faturamento do Setor:** O mercado global de smartphones seminovos e recondicionados movimenta cerca de **US$ 99,9 bilhões** anualmente.
* **Volume no Brasil:** Mais de **4,6 milhões de celulares usados** foram vendidos no país em 2025. O iPhone domina a cadeia de revenda devido à alta liquidez e durabilidade.
* **A Força do Seminovos:** Em portais de intermediação especializada, a venda de usados já representa **78% do volume comercializado**, consolidando a migração do público para a economia circular.

---

## 3. Os Três Pilares de Valor do iReport.app

Não vendemos chaves plists ou leitura de códigos USB. Vendemos os seguintes benefícios comerciais:

```
[ Pente-Fino contra Maquiagem ] ➔ [ Histórico Cautelar Permanente ] ➔ [ Selo QR Code para Vitrine ]
```

### Pilar A: Pente-Fino contra Maquiagem (Trade-in Seguro)
* **O Benefício:** O lojista avalia e precifica o aparelho do cliente com segurança total em 60 segundos. O cabo USB faz uma varredura profunda diretamente no circuito interno de energia e barramentos de peças.
* **O Resultado:** Se o aparelho tiver uma tela paralela sem assinatura ou uma bateria adulterada logicamente, o sistema alerta o lojista no ato, evitando uma compra ruim de R$ 2.000.

### Pilar B: O Histórico Cautelar Permanente (O "Carfax" do iPhone)
* **O Benefício:** Nosso maior diferencial competitivo e barreira de cópia. O iReport cria uma linha do tempo única para cada aparelho atrelada ao IMEI e número de série da placa-mãe (MLB).
* **O Resultado:** Se um aparelho foi vistoriado original em janeiro e reaparece em dezembro com outra bateria ou tela paralela, o sistema acusa na hora o histórico de substituição de peças. Isso impede que fraudes circulem sob laudos limpos no mercado de segundo uso.

### Pilar C: O Selo QR Code (Confiança que Vende)
* **O Benefício:** O laudo cautelar é convertido em um QR Code e um link público de verificação (`ireport.app/laudo/[id]`).
* **O Resultado:** O lojista gera a imagem do QR Code e o link encurtado para divulgar nos canais digitais (WhatsApp, Instagram ou anúncios). O cliente escaneia com o próprio celular, vê que o aparelho foi verificado por um sistema independente e fecha a compra com segurança, permitindo à loja vender com margens 15% superiores.

---

## 4. O que a Ferramenta Valida via USB (Geração de Provas)

Nosso software desktop (Tauri) conversa diretamente com os microchips do iPhone/iPad via USB, extraindo dados infalsificáveis para o laudo:
1. **Procedência do Modelo (Original vs. Reposição):** Decodifica a primeira letra do código do modelo (M: Varejo, F: Recondicionado oficial, N: Reposição de garantia, P: Personalizado).
2. **Ciclos Físicos Reais:** Lidos diretamente do chip controlador de carga, imunes a resets de software ou reprogramações cosméticas.
3. **Originalidade de Peças (Bateria/Tela/Face ID):** Compara as assinaturas físicas dos componentes com a gravada de fábrica na placa-mãe.
4. **Vínculos e MDM:** Checa se o dispositivo possui bloqueios de contas de terceiros (iCloud) ou se pertence a uma frota corporativa restrita (MDM).

---

## 5. Personas do Ecossistema (Perfis de Usuário)

* **Thiago (Lojista Avaliador):** Precisa avaliar aparelhos no balcão em minutos. O iReport blinda sua margem de lucro contra fraudes no trade-in.
* **Marcos (Técnico de Assistência):** Emite o laudo no check-in (entrada) para registrar os defeitos reais e no check-out (saída) para provar que o reparo foi executado sem danificar outras peças originais do cliente.
* **Roberta (Compradora Final):** Não aceita comprar iPhones seminovos em marketplaces sem ver o link público do laudo da iReport.app atestando a originalidade do hardware.

---

## 6. Modelo de Negócios (SaaS 100% Digital)

* **Plano Recorrente Fixo:** R$ 149,00 a R$ 199,00 por mês por loja física física.
* **O que está incluso:**
  * Licença do software desktop iReport Scanner (Windows/Mac) para os computadores da loja.
  * Emissão ilimitada de laudos cautelares criptografados.
  * Hospedagem das páginas públicas dos laudos.
  * **Kit de Divulgação Digital:** Geração automática de QR Codes de alta resolução e links encurtados prontos para serem salvos e anexados em stories do Instagram, mensagens de WhatsApp ou descrições de anúncios em marketplaces (OLX/Mercado Livre).
* **Justificativa de ROI:** Se o software evitar a compra de um único iPhone maquiado por ano, a loja já paga o custo do software por 12 meses.

---

## 7. Arquitetura de Software e Tecnologias (Escopo de Produção)

A plataforma **iReport.app** adota uma stack profissional e moderna, projetada para suportar alta concorrência na leitura de laudos, garantir a integridade dos dados históricos e automatizar 100% da esteira de testes e deploys.

### A) Stack Desktop (iReport Scanner)
* **Framework:** [Tauri](https://tauri.app/) (Rust no backend de sistema, HTML/JS/CSS no frontend visual).
* **Comunicação USB:** Biblioteca `libimobiledevice` (C/Rust) integrada nativamente ao core de Rust para comunicação com os serviços `lockdownd` e `syslog` do iOS/iPadOS.

### B) Stack Cloud & Web (Portal e APIs)
* **Frontend Web & Painel Lojista:** [Next.js](https://nextjs.org/) + React + TypeScript (otimizado para SEO, carregamento instantâneo via Server-Side Rendering e consistência de tipos).
* **API Backend:** Python com [FastAPI](https://fastapi.tiangolo.com/) (assíncrono, de altíssima performance).
* **Acesso a Banco e Migrações:** [SQLAlchemy](https://www.sqlalchemy.org/) (ORM de padrão corporativo) + [Alembic](https://alembic.sqlalchemy.org/) (controle versionado de migrações de banco de dados).

### C) Banco de Dados e Cache (Camada de Dados)
* **Banco de Dados Principal:** PostgreSQL hospedado de forma gerenciada no [Supabase](https://supabase.com/).
* **Camada de Cache:** [Redis](https://redis.io/) (utilizado para cachear os laudos públicos. Quando o cliente escaneia o QR Code, o laudo é lido instantaneamente do cache de memória do Redis, evitando consultas pesadas e caras ao PostgreSQL).

### D) Infraestrutura & DevOps (Containers e CI/CD)
* **Containerização:** [Docker](https://www.docker.com/) e Docker Compose (garante que o ambiente de desenvolvimento e produção da API rodem idênticos).
* **Esteira CI/CD:** [GitHub Actions](https://github.com/features/actions) (roda o linter, executa a suíte de testes automáticos a cada commit, compila os binários do Tauri e dispara o deploy do backend).
* **Distribuição e Deploy:** Vercel (Frontend Next.js) + Cloudflare (DNS, SSL, WAF) + Render/AWS (Backend Dockerizado).

### E) Testes Automatizados (Qualidade & Resiliência)
* **Testes Unitários e Integração (Backend):** [Pytest](https://docs.pytest.org/) (teste das rotas de API, parsing de XMLs e validação de assinaturas de payload).
* **Testes de UI e E2E:** [Playwright](https://playwright.dev/) (automação de testes de fluxo do usuário no navegador: login do lojista, geração de O.S. e leitura do laudo).
* **Testes de Carga e Performance:** [k6](https://k6.io/) (validação do limite de requisições concorrentes e comportamento de estresse nos endpoints de consulta pública do laudo).

### F) Observabilidade & Documentação
* **Observabilidade:** [OpenTelemetry](https://opentelemetry.io/) + Grafana (rastreamento de gargalos de rede, tempos de consultas ao banco de dados e monitoramento de logs de erro).
* **Documentação Arquitetural:** OpenAPI (Swagger integrado no FastAPI) + **ADRs (Architecture Decision Records)** na raiz do repositório para justificar decisões de design de software.

---

## 8. Protocolo de Contingência e Gestão de Riscos Fatais (Sad Paths)

* **Aparelhos Mortos (Não ligam) ➔ Fora de Escopo:** O iReport.app **não emite laudos para aparelhos inativos**. A tentativa de cadastrar aparelhos mortos manualmente abre brechas de fraudes com bandejas de chip e chassi trocados. O app exige conexão USB ativa para certificar.
* **Risco Fatal (Showstopper) - Apple Bloquear Porta USB:** Se a Apple criptografar ou remover por completo as portas de diagnósticos locais (iOS 19+), o modelo de negócios automatizado da iReport.app torna-se inviável.
  * *Fator de Mitigação:* A legislação de **Direito ao Reparo (Right to Repair)** da União Europeia proíbe a Apple de fechar barramentos de diagnósticos para reparadores independentes, garantindo que as portas de leitura de hardware permaneçam abertas.
* **Contingência para Versões de iOS Não Homologadas:** Se uma atualização do iOS alterar chaves e quebrar a leitura automatizada temporariamente:
  1. **Bloqueio de Emissão:** O software suspende a emissão e orienta a loja a aguardar o patch. Não permitimos digitação manual para preservar a neutralidade da marca.
  2. **Hotfix Automático:** O app Tauri baixa a atualização silenciosa com a correção de comunicação USB assim que liberado pela comunidade global de engenharia reversa.

---

## 9. Pré-requisitos de Conectividade do Dispositivo (iPhone / iPad)

Para que o iReport Scanner execute a varredura automática, analisamos as barreiras de segurança do sistema operacional Apple e definimos os pré-requisitos necessários no aparelho do cliente final:

### A) Confirmação de Confiança (Pair Record) ➔ ÚNICO PRÉ-REQUISITO REAL
* **A Barreira:** Ao conectar o cabo USB no computador da loja, o iPhone/iPad disparará a mensagem nativa da Apple: *"Confiar neste Computador? Seus dados e configurações estarão acessíveis..."*.
* **A Ação Necessária:** O cliente deve desbloquear a tela do aparelho, tocar em **"Confiar"** e **digitar o código numérico de bloqueio (senha de tela)** do próprio celular.
* **Tratamento do App:** Se o aparelho não for autorizado, a API de USB retornará `ERR_LOCKDOWN_LOCK` (senha protegida). O app iReport exibirá um passo a passo visual instruindo o lojista a pedir para o cliente desbloquear a tela e aceitar a confiança no celular.

### B) Modo de Desenvolvedor (Developer Mode) ➔ NÃO É NECESSÁRIO
* **Detalhamento:** No iOS 16+, a Apple introduziu o "Modo de Desenvolvedor" para impedir que softwares maliciosos instalem aplicativos não assinados via USB. 
* **Compatibilidade do iReport:** O iReport **NÃO exige a ativação do Modo de Desenvolvedor** no aparelho do cliente. Como acessamos apenas variáveis do domínio de diagnósticos nativo da Apple (as mesmas usadas pelo iTunes ou pelo Genius Bar da Apple Store), a leitura roda limpa em qualquer celular original de fábrica após a confirmação de confiança descrita no item A.

### C) Jailbreak ou Modificações de Sistema ➔ NÃO É NECESSÁRIO
* **Detalhamento:** A varredura de hardware é 100% oficial e segura, operando sem a necessidade de quebras de segurança (*Jailbreak*), preservando a integridade física e a garantia do cliente.

### D) Estado de Ativação do Aparelho (iCloud e Operadora)
* O celular pode estar formatado, na tela inicial de "Olá", ou com chip ativo. Contanto que a tela esteja desbloqueada para aceitar o popup de confiança (item A), a varredura ocorrerá com sucesso.

---

## 10. Mapeamento de Chaves e Variáveis de Hardware Extraídas

Para fins de auditoria e transparência, o iReport Scanner consome chaves específicas divididas em dois domínios da Apple:

### A) Domínio do Sistema Geral (`ideviceinfo` via `lockdownd`)
* **`UniqueDeviceID` (UDID):** Identificador exclusivo do dispositivo de 40 caracteres hexadecimais (usado para indexar a entidade física no banco de dados).
* **`InternationalMobileEquipmentIdentity` (IMEI):** Identificador global do modem de celular (usado para consultas de blacklist e roubo).
* **`DeviceName`:** Nome personalizado do aparelho definido pelo usuário (ex: "iPhone de Thiago").
* **`ProductType`:** Código de engenharia do modelo (ex: `iPhone14,2` para o iPhone 13 Pro).
* **`ProductVersion`:** Versão atual do iOS (ex: `17.4.1`).
* **`ModelNumber`:** Número do modelo comercial (ex: `MLV93BR/A`). A primeira letra é usada para identificar o canal de fabricação (M: Varejo, F: Recondicionado, N: Reposição, P: Personalizado).
* **`MLBSerialNumber`:** O número de série gravado fisicamente na placa-mãe (MLB). É a âncora principal para cruzar a originalidade dos demais chips.
* **`fm-activation-locked`:** Retorna `WUVT` (Yes) ou `NO` para indicar se o bloqueio do buscar iCloud está ativo.
* **`ActivationState`:** Estado de ativação do iOS (ex: `Activated`, `Unactivated`).

### B) Domínio da Bateria (`idevicediagnostics ioregentry AppleSmartBattery`)
* **`CycleCount`:** Contagem acumulada de ciclos de carga físicos completos (lida do circuito integrado da bateria).
* **`DesignCapacity`:** Capacidade de carga nominal de fábrica em mAh (ex: `3095` mAh para iPhone 13 Pro).
* **`AppleRawMaxCapacity`:** Capacidade química máxima atual que a bateria consegue reter em mAh (atualizada pelo algoritmo químico do iOS).
* **`Serial`:** O número de série exclusivo do microchip pareado da bateria (ex: `F8Y5103CZPU18FKBA`).
* **`BatteryCurrentCapacity` / `CurrentCapacity`:** Porcentagem atual de carga do celular (ex: 80%).

---

## 11. Protocolo de Validação de Originalidade: Absoluto vs. Histórico

Para evitar o "Exploit do Aparelho Adulterado de Fábrica" (quando um iPhone já entra no sistema com peças paralelas e o sistema o homologa como original com base no primeiro registro estável), o iReport aplica duas camadas independentes de validação:

```
                  +--------------------------------------------+
                  |         DISPOSITIVO ESCANEADO USB          |
                  +--------------------------------------------+
                                        |
                 +----------------------+----------------------+
                 |                                             |
                 v                                             v
     [ 1. VALIDAÇÃO ABSOLUTA ]                     [ 2. VALIDAÇÃO HISTÓRICA ]
     - O serial da bateria é válido?               - O serial do componente mudou
     - O formato condiz com a placa-mãe?             em relação ao Scan anterior?
     - Retorna string corrompida ou vazia?          - O IMEI já existia no banco?
                 |                                             |
                 +----------------------+----------------------+
                                        |
                                        v
                          [ LAUDO CAUTELAR GERADO ]
```

### 1. Validação Absoluta (Inspeção Intrínseca da Peça)
Ocorre de forma isolada em toda e qualquer varredura, mesmo que seja o primeiro contato do aparelho com o sistema. O software analisa as características físicas do chip:
* **Formato e Tamanho de Serial:** O número de série do componente (bateria, tela) deve seguir o padrão de tamanho (17 caracteres) e estrutura alfanumérica oficiais da Apple.
* **Anomalia de Retorno:** Chips de baterias paralelas chinesas ou telas recondicionadas sem chip de calibração costumam retornar a chave de serial vazia (`""`), nula (`N/A`) ou preenchida com caracteres genéricos de reset (ex: `0000000000000`). O sistema identifica essas anomalias imediatamente e marca o status como **"Não Original / Paralela"**, independente de histórico.
* **Pareamento de MLB:** Cruzamento dos prefixos de fabricação do serial do componente com o serial da placa-mãe (MLB). Peças originais de fábrica possuem códigos de lote congruentes.

### 2. Validação Histórica (Linha do Tempo de Alterações)
Ocorre comparando o scan atual com os registros anteriores armazenados no banco de dados do Supabase indexados pelo IMEI/UDID:
* **Monitoramento de Substituição:** Se no Scan 1 (Janeiro) a bateria possuía o serial `F8Y123` e no Scan 2 (Julho) ela apresenta o serial `F8Y456`, o sistema acusa instantaneamente: **"Alteração Detectada: Bateria Substituída"**.
* **Proteção de Conformidade:** Se a peça substituída for original Apple (por exemplo, trocada em uma assistência autorizada), a **Validação Absoluta** dirá que a peça é original, mas a **Validação Histórica** informará que ela foi trocada. O laudo exibirá: `Bateria: Original Apple (Substituída recentemente)`.

Essa abordagem de duas camadas garante que uma maquiagem prévia seja detectada na hora da entrada e que qualquer modificação posterior seja registrada na linha do tempo permanente.


