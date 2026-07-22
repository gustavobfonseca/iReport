# iReport Scanner

Aplicativo desktop para vistoria técnica de iPhones e iPads seminovos. Conecta via USB, lê os dados de hardware diretamente do dispositivo (bateria, integridade do sistema, autenticidade de peças, bloqueios) e gera um laudo técnico objetivo — sem modificar, interpretar ou emitir julgamento subjetivo de valor.

Este repositório também documenta a engenharia de qualidade por trás do produto: estratégia de testes, pipeline de CI/CD e as decisões técnicas que sustentam isso em produção.

---

## O problema que o projeto resolve

O mercado de iPhones/iPads seminovos movimenta bilhões de reais por ano e sofre com um problema estrutural: **assimetria de informação**. Comprador e vendedor raramente têm acesso aos mesmos dados técnicos do aparelho — saúde real da bateria, se a tela ou a bateria são peças não genuínas, se o iCloud/MDM ainda está vinculado, se o modem (baseband) responde, se há histórico de kernel panics.

O iReport lê esses dados **direto do chip**, via `libimobiledevice`, e traduz o resultado em um laudo padronizado — o mesmo tipo de informação que hoje depende de inspeção visual ou da palavra do vendedor. Isso tem valor econômico direto para lojas de seminovos, marketplaces e avaliadores, reduzindo disputas pós-venda e fraude.

---

## Habilidades demonstradas neste projeto

| Área | O que este repositório mostra na prática |
|---|---|
| **Desenvolvimento full-stack desktop** | App Tauri real (Rust + WebView) integrando um binário de sistema (`libimobiledevice`) a uma UI React/TypeScript, com estado de máquina explícito, eventos assíncronos do backend (`emit`/`listen`) e tipagem ponta a ponta entre Rust e TS. |
| **QA / Estratégia de testes** | Pirâmide de testes real e proporcional: 11 testes unitários Rust (incluindo contrato golden-file com o formato real do `ideviceinfo`/`idevicediagnostics`), 35 unitários/componentes (Vitest + Testing Library), 16 E2E (Playwright + Page Object Model, agrupados por fluxo de usuário, tagueados por criticidade). Testado pelo comportamento observável, não pela implementação. |
| **CI/CD** | Duas pipelines Azure DevOps com estágios de lint, teste, cobertura, build e publicação de artefatos, mais uma pipeline parametrizada para execução seletiva de suítes (smoke/sanity/regressão) sob demanda. |
| **Containerização & Distribuição** | Imagem Docker própria para o agente de build (Node + Rust + libs do Tauri), publicada em pipeline dedicada; empacotamento multiplataforma do app via Tauri (`.dmg`/`.app`, `.msi`, `.deb`/`.AppImage`) a partir de uma única base de código. |
| **Qualidade estática** | ESLint (flat config) + Prettier + `cargo clippy`, TypeScript estrito (`noUnusedLocals`/`noUnusedParameters`, zero `any`), zero warnings no estado atual do repositório. |

---

## Stack

| Camada | Tecnologia |
|---|---|
| Desktop shell | [Tauri 2](https://tauri.app/) (Rust + WebView nativo) |
| Backend | Rust — leitura de hardware via `libimobiledevice` (`ideviceinfo`, `idevicediagnostics`) |
| Frontend | React 19 + TypeScript + Vite 7 |
| Estilo | Tailwind CSS 4 |
| Gráficos | Recharts (telemetria de bateria em tempo real) |
| Testes unitários/componentes | Vitest + Testing Library + `@vitest/coverage-v8` |
| Testes E2E | Playwright (Page Object Model) |
| Qualidade estática | ESLint (flat config) + Prettier + `cargo clippy` |
| CI/CD | Azure Pipelines (2 pipelines) + imagem Docker própria do agente de build |

---

## Desenvolvimento do app

```bash
cd desktop
npm install
npm run tauri dev
```

> Requisito: `libimobiledevice` instalado no sistema (`brew install libimobiledevice` no macOS).

O backend Rust (`src-tauri/src`) fala diretamente com o iPhone via USB através dos binários do `libimobiledevice`, faz o parsing da saída em plist e expõe o comando Tauri `read_usb_device` para o frontend. Uma thread em background emite telemetria de bateria a cada segundo (`app_handle.emit`), consumida no frontend via `listen` — sem polling do lado do React.

### Build e distribuição

```bash
npm run build          # tsc + vite build (frontend)
npm run tauri build    # binário desktop distribuível
```

Com `bundle.targets: "all"` no `tauri.conf.json`, o mesmo código gera instalador nativo por plataforma a partir de uma única base: `.app`/`.dmg` no macOS, `.msi`/NSIS no Windows, `.deb`/`.AppImage` no Linux. A pipeline de CI valida o build do frontend e a compilação do backend a cada push; a geração dos instaladores finais roda localmente/sob demanda via `tauri build`.

---

## Estratégia de testes

O projeto segue uma pirâmide de testes com responsabilidades bem separadas — cada camada testa o que só ela pode testar, sem redundância entre elas.

```
        ▲  E2E (Playwright) — 16 testes
       ╱ ╲   fluxo completo do usuário, integração real dos componentes
      ╱   ╲
     ╱     ╲  Unitários/Componentes (Vitest + Testing Library) — 35 testes
    ╱       ╲   lógica pura de adaptação/validação, componentes isolados
   ╱         ╲
  ╱───────────╲ Unitários Rust (cargo test) — 11 testes
                 parsing de plist, arredondamento de capacidade, contrato golden-file
```

### 1. Backend Rust (`desktop/src-tauri/src`)

```bash
cd desktop/src-tauri
cargo test              # 11 testes
cargo clippy --all-targets
```

Cobre as funções puras que decodificam a saída de `ideviceinfo`/`idevicediagnostics` (formato plist XML) e a regra de arredondamento de capacidade de armazenamento para os tamanhos comerciais da Apple (16/32/64/128GB...). É a camada mais crítica do ponto de vista de correção: um erro de parsing aqui gera um laudo tecnicamente errado.

**Testes de contrato (golden-file).** A função que orquestra o scan real (`scan_device`/`full_scan` em `commands.rs` — orquestração dos comandos de diagnóstico em paralelo e guard contra scan concorrente) não pode ser testada com um iPhone conectado em CI. Em vez disso, a execução dos binários é abstraída atrás de uma trait `DeviceCommandRunner`; os testes injetam uma implementação fixa que devolve fixtures em `tests/fixtures/` reproduzindo o formato **real** de saída do `ideviceinfo`/`idevicediagnostics` (não strings soltas inventadas) e validam o `DeviceData` final para um cenário limpo e um comprometido. Isso trava o contrato entre o código e o formato de texto que os binários do libimobiledevice devolvem — se esse formato mudar, o teste quebra aqui, não em produção com um laudo errado sobre um device real.

### 2. Unitários e componentes (`desktop/tests`)

```bash
npm run test              # roda uma vez
npm run test:watch        # modo watch
npm run test:coverage     # com relatório de cobertura (text + html + lcov)
```

| Arquivo | O que valida |
|---|---|
| `tests/adapters/deviceAdapter.spec.ts` | Tradução do payload bruto do Rust para o modelo de UI — status de MDM, iCloud, fusing, baseband, bateria (fronteiras 85/84/80), integridade de armazenamento, normalização de telemetria |
| `tests/utils/deviceMappings.spec.ts` | Resolução do nome comercial do modelo (`product_type` → "iPhone X") |
| `tests/utils/specsManager.spec.ts` | Cache em `localStorage`, fallback seguro para JSON malformado/inválido, atualização remota de especificações |
| `tests/components/InspectionRow.spec.tsx` | Renderização condicional do ícone de alerta, exibição/ocultação do tooltip ao passar o mouse |
| `tests/components/Sidebar.spec.tsx` | Bloco de armazenamento: cálculo do percentual de uso e coerência entre capacidade, usado e livre a partir da UI renderizada |

Ambiente configurado com `jsdom` + React Testing Library para testar componentes pelo comportamento observável (o que o usuário vê/clica), não pela implementação interna.

### 3. End-to-end (`desktop/e2e`)

```bash
npm run e2e            # todos os testes
npx playwright test --grep "@smoke"        # fumaça: crítico e rápido
npx playwright test --grep "@sanity"       # fluxo completo por cenário
npx playwright test --grep "@regression"   # suíte completa
```

Estrutura em **Page Object Model** com fixtures customizadas do Playwright, para manter os arquivos de spec declarativos e desacoplados de seletores de DOM:

```
e2e/
├── fixtures/index.ts        # injeta os Page Objects prontos em cada teste
├── pages/                   # um objeto por área da tela (Sidebar, WaitingPage, ...)
├── data/devices.ts          # fixtures de dados esperados por cenário de mock
└── *.spec.ts                # specs, tagueados @smoke / @sanity / @regression
```

Os 16 testes cobrem dois cenários completos de dispositivo (um "limpo" e um "comprometido" — com iCloud lock, MDM ativo e peças não genuínas) e os fluxos transversais de navegação, desconexão e persistência de estado da UI. Agrupados por fluxo de usuário, não por campo isolado: a tradução de dado bruto para veredito de UI já é validada a fundo no Vitest (`deviceAdapter.spec.ts`), então o E2E prova que o fluxo renderiza e navega de ponta a ponta, sem reimplementar a mesma asserção em duas camadas.

---

## Qualidade de código

```bash
npm run lint            # ESLint (typescript-eslint + react-hooks + react-refresh)
npm run format:check    # Prettier
```

TypeScript com `noUnusedLocals`/`noUnusedParameters` ativos, zero uso de `any` no código de aplicação e zero warnings de lint no estado atual do repositório.

---

## Rodando os checks localmente (o mesmo que o CI roda)

Quem clona o repositório não tem acesso às pipelines do Azure DevOps deste projeto (elas rodam na conta do mantenedor), mas os mesmos checks rodam localmente sem nenhuma dependência externa:

```bash
cd desktop
npm install

# equivalente ao que azure-pipelines.yml roda a cada push em main
npm run lint
npm run format:check
npm run test:coverage
(cd src-tauri && cargo test --locked && cargo clippy --all-targets)
npm run build

# equivalente à pipeline manual azure-tests.yml (Full Suite)
npx playwright install chromium
npx playwright test --grep "@regression"
```

Todos os comandos usam apenas as ferramentas já declaradas em `package.json`/`Cargo.toml` — nenhum passo exige a imagem Docker do build agent nem conta no Azure DevOps.

---

## CI/CD (Azure Pipelines)

- **`azure-pipelines.yml`** — roda a cada push em `main`: lint → testes unitários + cobertura → testes e lint do Rust (`cargo test` + `cargo clippy`) → build do frontend → validação do artefato → publicação do build e do relatório de cobertura.
- **`azure-tests.yml`** — pipeline manual/parametrizada para rodar sob demanda: `Unit Tests`, `E2E — Smoke`, `E2E — Sanity`, `E2E — Regression`, ou a suíte completa. Pensada para permitir rodar só o necessário (ex.: smoke antes de um deploy rápido) sem esperar a suíte inteira.
- **`docker-image-pipeline.yml`** — builda e publica em Docker Hub a imagem usada como agente de build das outras duas pipelines.

### Por que uma imagem Docker própria para o agente de build

As pipelines de teste e build dependem de uma combinação específica de ferramentas (Node, Rust/Cargo, e as bibliotecas nativas que o Tauri exige para linkar — `webkit2gtk`, `gtk3`, `librsvg`, etc.). Manter isso como uma imagem Docker versionada, em vez de instalar tudo a cada execução:

- torna o tempo de pipeline previsível (sem reinstalar toolchain a cada run);
- garante que todo mundo (CI e, se necessário, outro desenvolvedor) builda com exatamente as mesmas versões;
- isola a atualização de toolchain (ex.: bump de versão do Rust) da lógica das pipelines de teste/build.

---

## Estrutura do projeto

```
desktop/
├── src/                    # React + TypeScript (UI)
│   ├── adapters/           # payload bruto → modelo de UI
│   ├── components/
│   ├── services/           # chamadas ao backend Tauri
│   ├── utils/               # regras de negócio puras (validação, specs)
│   └── types/
├── src-tauri/src/          # Rust (leitura de hardware)
├── tests/                  # unitários/componentes (Vitest)
└── e2e/                    # end-to-end (Playwright, POM)
```
