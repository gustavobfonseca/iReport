# Plano de Desenvolvimento do MVP: iReport.app

Este documento estabelece o escopo focado do MVP (Mínimo Produto Viável) e as fases de entrega para construir a plataforma **iReport.app** seguindo a especificação enxuta e direta de validação.

---

## 1. Escopo Focado do MVP

O MVP do iReport foi simplificado para focar unicamente nas duas plataformas (Desktop e Web) e na entrega de valor imediata no balcão da loja:

### 🖥️ Plataforma Desktop (iReport Scanner)
* **Login de Usuário:** O técnico/lojista faz o download do aplicativo de bancada, abre e faz login na conta da loja.
* **Detecção e Leitura Automática:** O aplicativo inicializa em tela de espera: *"Insira o celular"*. Ao espetar o cabo USB no celular, o software detecta e executa a varredura automática em background.
* **Exibição do Relatório (Tomada de Decisão):** O app exibe na tela todos os parâmetros traduzidos de forma amigável (Saúde Real de Bateria, Ciclos Físicos, Originalidade do Chip de Bateria/Tela e iCloud) para que o técnico possa avaliar e tomar a decisão técnica.
* **Ação Central - Botão "Gerar Laudo":** Botão em destaque posicionado abaixo do relatório de hardware. Ao clicar, o app assina digitalmente o JSON de auditoria e envia para a nuvem.

### 🌐 Plataforma Web (Nuvem iReport.app)
* **Geração do Laudo Público:** Ao clicar em "Gerar Laudo" no desktop, a API gera uma página HTML pública e dinâmica com um ID identificador exclusivo (ex: `ireport.app/laudo/[laudo_id]`).
* **Visualizador do Laudo:** A página web renderiza os dados completos de originalidade do hardware do dispositivo, a **data e hora da criação** da varredura e o **nome da loja parceira** (puxado automaticamente da conta do lojista).
* **Divulgação Dinâmica (QR Code e Link):** A página disponibiliza um botão de copiar o link encurtado e o **QR Code compartilhável** em formato de imagem. O lojista pode compartilhar no WhatsApp, stories do Instagram ou colar na descrição de anúncios em marketplaces (OLX/Mercado Livre) para provar a originalidade.
* **Respaldo para o Cliente:** Serve como comprovante de integridade das peças (comprador de seminovo confia na hora, e cliente de assistência tem a garantia de que nenhuma outra peça foi alterada no check-in/check-out).

---

## 2. Lista de Pré-requisitos do Desenvolvedor

### A) Ferramentas Locais
1. **Git:** Controle de versão.
2. **Node.js (v18+):** Compilação do frontend Next.js e Tauri.
3. **Python (3.10+):** Backend FastAPI e script local de testes USB.
4. **Rust & Cargo:** Obrigatório para a compilação do executável leve do Tauri.
5. **Docker:** Para rodar a API em container idêntico ao de produção.
6. **libimobiledevice:** Pacotes de comunicação USB no Mac/Windows.

### B) Serviços em Nuvem (Contas Gratuitas)
1. **Supabase:** Banco de dados PostgreSQL (laudos, lojas, dispositivos) + Auth.
2. **Render ou Railway:** Hospedagem da API FastAPI Dockerizada.
3. **Vercel:** Hospedagem do portal web e visualizador Next.js.

---

## 3. Cronograma de Execução: As 4 Fases do MVP

### 📂 Fase 1: API & Banco de Dados (Semana 1)
* Criar tabelas PostgreSQL no Supabase (`lojas`, `dispositivos`, `laudos` contendo tipo e metadados).
* Desenvolver a API FastAPI (Python):
  * Rota `POST /laudos/submit` (recebe a vistoria USB, valida assinatura SHA-256 e grava).
  * Rota `GET /laudos/{id}` (retorna metadados da loja, timestamp e integridade de peças).

### 🖥️ Fase 2: Aplicativo Desktop (Tauri Scanner) (Semana 2)
* Inicializar projeto Tauri com React/TypeScript.
* Backend em Rust escuta portas USB e chama a leitura local das variáveis de bateria/sistema (`lockdownd`).
* Interface do App:
  * Tela 1: Login.
  * Tela 2: "Insira o celular via USB".
  * Tela 3: Diagnósticos traduzidos na tela com o botão inferior **"Gerar Laudo"**.

### 🌐 Fase 3: Portal Web e Compartilhamento Next.js (Semana 3)
* Criar rotas Next.js:
  * `/laudo/[id]` (Visualizador dinâmico com nome do lojista, timestamp de criação e status de originalidade).
* Implementar a geração da imagem de QR Code e botão de copiar link curto na própria tela de visualização do laudo.

### 🚀 Fase 4: QA, Testes e Publicação (Semana 4)
* Escrever testes de rotas com **Pytest** e testes E2E do fluxo de geração com **Playwright**.
* Fazer o deploy do Next.js na **Vercel** e do container da API no **Render**.
* Configurar o **Cloudflare** para apontar domínio com SSL.

---

## 4. Checklist Prático de Lançamento
* [ ] Banco Postgres e Auth Supabase ativos.
* [ ] API respondendo em ambiente de produção HTTPS.
* [ ] Frontend Web Vercel acessando dados da API em tempo real.
* [ ] Executável do iReport Scanner (.exe/.dmg) compilado e realizando login.
* [ ] Teste final de ponta a ponta: Celular conectado ➔ Relatório exibido na tela desktop ➔ Botão "Gerar Laudo" clicado ➔ Laudo aberto no navegador com QR Code ativo e nome da loja correto.
