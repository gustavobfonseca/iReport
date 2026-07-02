# Arquitetura de Software: C4 Model (iReport.app)

Este documento especifica a arquitetura da plataforma **iReport.app** utilizando a metodologia **C4 Model** (Nível 1 - Contexto do Sistema e Nível 2 - Containers).

---

## 1. Nível 1: Diagrama de Contexto (System Context)

O diagrama de contexto exibe o ecossistema do iReport.app em alto nível, mostrando como as personas e os sistemas externos (dispositivo físico da Apple) se relacionam com o nosso sistema.

```mermaid
graph TB
    subgraph Personas ["Personas"]
        UserA["Lojista / Técnico<br>(Thiago / Marcos)"]
        UserB["Comprador Final<br>(Roberta)"]
    end

    System["Sistema iReport.app<br>(Auditoria e Emissão de Laudos)"]
    AppleDevice["Dispositivo Apple Físico<br>(iPhone / iPad)"]

    UserA -->|1. Conecta via USB| AppleDevice
    UserA -->|2. Executa vistoria e gerencia laudos| System
    AppleDevice -->|3. Envia dados brutos de hardware| System
    UserB -->|4. Consulta laudo verificado| System

    style System fill:#4F46E5,stroke:#312E81,stroke-width:2px,color:#fff
    style AppleDevice fill:#374151,stroke:#1F2937,stroke-width:1px,color:#fff
    style UserA fill:#10B981,stroke:#047857,stroke-width:1px,color:#fff
    style UserB fill:#2563EB,stroke:#1E40AF,stroke-width:1px,color:#fff
```

### Detalhamento das Relações (Contexto)
1. **Lojista (Thiago/Marcos) ➔ Dispositivo Apple:** Conecta fisicamente o aparelho do cliente via cabo Lightning/USB-C no computador da loja.
2. **Lojista (Thiago/Marcos) ➔ iReport.app:** Opera o aplicativo desktop para comandar a vistoria e acompanhar o histórico de auditorias.
3. **Dispositivo Apple ➔ iReport.app:** Envia as assinaturas de hardware, serial da bateria, contagem de ciclos e status do iCloud via canal de diagnóstico USB.
4. **Comprador Final (Roberta) ➔ iReport.app:** Acessa a página pública de laudo verificada (via QR Code colado no aparelho ou link de anúncio) para checar o estado de originalidade antes de comprar.

---

## 2. Nível 2: Diagrama de Containers

Este nível detalha o interior do sistema da iReport.app, exibindo os containers de software (aplicações, bancos de dados, APIs) que compõem o produto e como eles conversam entre si.

```mermaid
graph TB
    subgraph Cliente ["Cliente (Computador da Loja)"]
        DesktopApp["iReport Scanner App (Tauri / Rust)<br>Executável leve de bancada"]
        AppleDevice["Dispositivo Físico<br>(iPhone / iPad)"]
    end

    subgraph Nuvem ["Nuvem iReport.app"]
        WebPortal["Web Portal (HTML/CSS/JS)<br>Landing Page & Laudo Viewer"]
        APIServer["API Backend (FastAPI / Python)<br>Validação de Payload & Regras"]
        Database["Banco de Dados (Supabase / Postgres)<br>Laudos, Lojas, Dispositivos e Histórico"]
    end

    UserA["Lojista / Técnico"] -->|Operações na UI| DesktopApp
    UserB["Comprador Final"] -->|Acessa laudo web| WebPortal
    
    AppleDevice -->|Protocolo lockdownd USB| DesktopApp
    DesktopApp -->|Upload de JSON assinado HTTPS| APIServer
    WebPortal -->|Consome dados do laudo HTTPS| APIServer
    APIServer -->|Leitura e escrita SQL| Database

    style DesktopApp fill:#4F46E5,stroke:#312E81,stroke-width:2px,color:#fff
    style WebPortal fill:#2563EB,stroke:#1E40AF,stroke-width:2px,color:#fff
    style APIServer fill:#7C3AED,stroke:#5B21B6,stroke-width:2px,color:#fff
    style Database fill:#10B981,stroke:#047857,stroke-width:2px,color:#fff
    style AppleDevice fill:#374151,stroke:#1F2937,stroke-width:1px,color:#fff
```

### Detalhamento dos Containers

#### A) iReport Scanner App (Tauri / Rust / HTML / CSS)
* **Responsabilidade:** Rodar localmente no computador da assistência. É o responsável por monitorar as conexões USB, interagir com o daemon do iOS/iPadOS (`lockdownd`), extrair a árvore de propriedades do hardware (`ioreg`) e assinar criptograficamente o payload JSON gerado.
* **Tecnologias:** Tauri (Rust no backend de sistema, HTML5/CSS3/JS no frontend visual).
* **Protocolos:** USB (protocolo proprietário Apple de diagnóstico via `libimobiledevice`) e HTTPS (comunicação com a API).

#### B) Web Portal / Laudo Viewer (HTML / CSS / JS)
* **Responsabilidade:** Exibir a página de apresentação comercial do produto (Landing Page), formulários de inscrição e, principalmente, renderizar o **Laudo Cautelar Público** para compradores finais.
* **Tecnologias:** HTML5, CSS3 vanilla e JavaScript ES6. O laudo é renderizado do lado do cliente (*client-side rendering*) consumindo a API.
* **Protocolos:** HTTPS.

#### C) API Backend (FastAPI / Python)
* **Responsabilidade:** Centralizar as regras de negócio. Recebe a submissão de auditorias do App Desktop, valida a assinatura SHA-256 do payload (garantindo que o lojista não hackeou ou editou os dados), compara varreduras anteriores para alimentar o **Histórico Permanente**, gerencia contas e autoriza sessões de lojas parceiras.
* **Tecnologias:** Python com FastAPI (alta performance de processamento e concorrência assíncrona).
* **Protocolos:** HTTPS/REST e conexão de banco nativa (PostgreSQL Driver).

#### D) Banco de Dados (Supabase / PostgreSQL)
* **Responsabilidade:** Armazenar de forma persistente os dados de lojas, o histórico de componentes de cada dispositivo único (mapeado pelo IMEI/MLB) e os laudos gerados.
* **Tecnologias:** PostgreSQL (hospedado de forma gerenciada no Supabase).
