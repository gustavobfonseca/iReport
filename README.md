# iReport | O Laudo Cautelar do iPhone Usado

O **iReport** é um ecossistema de vistoria técnica e laudo cautelar independente para **iPhones e iPads** seminovos. O sistema blinda a margem financeira de lojistas no Trade-in contra fraudes de hardware maquiado e acelera vendas provando a originalidade do aparelho via QR Code para o consumidor.

---

## 📸 Preview das Interfaces

### 1. iReport Scanner (Aplicativo Desktop - Tauri/Rust)
Instalado na bancada da loja, detecta a conexão USB automaticamente e exibe o raio-x físico das peças do dispositivo.
![Mockup da Interface do iReport Scanner](docs/assets/desktop_app_mockup_1783004062613.png)

### 2. Laudo Cautelar Verificado (Portal Mobile Web)
Página pública que o comprador final acessa pelo WhatsApp ou escaneando o QR Code na vitrine da loja.
![Mockup do Laudo Cautelar Web](docs/assets/web_laudo_mockup_1783004078992.png)

---

## 🚀 Como Testar a Varredura (Modo Demo Interativo)

Para testar o fluxo de ponta a ponta na sua máquina local de forma interativa, sem precisar de iPhones físicos ou instalar dependências de hardware (`libimobiledevice`), execute o script simulador em seu terminal:

```bash
python3 validador_bateria.py --demo
```

### Cenários de Simulação Disponíveis no Terminal:
* **Opção 1 - iPhone 13 Pro (100% Original):** Emite um laudo de conformidade perfeito. A saúde química da bateria marca 91.2%, os ciclos estão corretos e o **Histórico Permanente** fica verde, indicando que nenhuma peça foi adulterada.
* **Opção 2 - iPhone 11 (Bateria Maquiada):** Simula a fraude mais comum do mercado (baterias reprogramadas com chips falsos para mentir 100% nos Ajustes). O sistema calcula a saúde real de 72% com 852 ciclos físicos, acende os alertas vermelhos e marca **"Substituição Suspeita"** na linha do tempo histórica.
* **Opção 3 - iPad Air 4 (Dados Ocultos):** Demonstra a leitura física de ciclos e capacidade de carga que a Apple oculta nativamente no iPadOS.

O script salvará o laudo estruturado na pasta `outputs/`, gerará o espelho dinâmico `laudo_ativo.js` e abrirá o arquivo `index.html` automaticamente no navegador do seu computador.

---

## 🛠️ Stack Tecnológica & Arquitetura (Escopo de Produção)

* **Desktop App:** [Tauri](https://tauri.app/) (Rust no backend de sistema, HTML/JS/CSS no frontend visual) + `libimobiledevice` (C/Rust) conversando com o daemon `lockdownd` do iOS.
* **Web Portal & APIs:** [Next.js](https://nextjs.org/) + React + TypeScript no frontend, Python com [FastAPI](https://fastapi.tiangolo.com/) no backend (Dockerizado).
* **Banco de Dados & Cache:** PostgreSQL gerenciado no [Supabase](https://supabase.com/) + Caching de laudos em memória com [Redis](https://redis.io/).
* **Esteira CI/CD & Deploy:** GitHub Actions (matrix tests e build) + Vercel (Front) + Cloudflare (Segurança/DNS) + Render/AWS (API Dockerizada).
* **Testes Automatizados (QE):** [Pytest](https://docs.pytest.org/) (rotas da API e regras de criptografia), [Playwright](https://playwright.dev/) (testes de UI e E2E) e [k6](https://k6.io/) (testes de estresse e carga concorrente de QR Codes).

---

## 📖 Documentação do Projeto

O detalhamento de regras de negócio, modelagem de banco de dados, fluxos de O.S. e diagramas arquiteturais estão organizados na pasta `docs/`:

* 📄 [Documentação do Projeto (PRD)](docs/documentacao_projeto.md): Visão de negócios, persona, monetização e limitações de sandbox.
* ⏳ [Roteiro e Jornada do Usuário](docs/fluxo_usuario_ireport.md): Fluxogramas detalhados do fluxo de Trade-in e do fluxo de Ordem de Serviço (Check-in/Check-out de reparos).
* 📊 [Matriz de Decisão & Inteligência](docs/matriz_decisoes_ireport.md): Como o sistema mapeia dados brutos (mAh, ciclos, seriais) em conclusões textuais amigáveis e pega fraudes de bateria maquiada.
* 📐 [Arquitetura C4 Model (Nível 1 e 2)](docs/arquitetura_c4model.md): Diagrama de Contexto de Negócio e Diagrama de Containers do ecossistema.
* ☁️ [Arquitetura de Nuvem e Rede](docs/arquitetura_nuvem.md): Distribuição de servidores, DNS, segurança de borda (WAF) e persistência de dados.
* 📋 [Plano de Lançamento do MVP](docs/plano_implementacao_mvp.md): Cronograma passo a passo de desenvolvimento dividido em 4 semanas.
