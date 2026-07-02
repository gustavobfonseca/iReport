# Arquitetura em Nuvem: Infraestrutura e Roteamento (iReport.app)

Este documento especifica a topologia de infraestrutura em nuvem, provedores de hospedagem e o fluxo de tráfego seguro para a plataforma **iReport.app**.

---

## 1. Diagrama de Infraestrutura e Rede

O diagrama abaixo detalha como os serviços são distribuídos entre os diferentes provedores de nuvem (Vercel, Render/AWS e Supabase) protegidos pela camada de borda do Cloudflare.

```mermaid
graph TD
    Client["App Desktop (iReport Scanner)<br>(Bancada da Loja)"]
    Browser["Navegador Web<br>(Comprador / Lojista)"]

    subgraph Camada_Borda ["Borda e Segurança (Cloudflare)"]
        WAF["WAF & SSL Termination"]
    end

    subgraph Hospedagem_Frontend ["Frontend (Vercel)"]
        StaticSite["Web Portal / Landing Page<br>(HTML/CSS/JS Estático)"]
    end

    subgraph Hospedagem_Backend ["Computação API (Render / AWS App Runner)"]
        API["API FastAPI (Python)<br>(Docker Container)"]
    end

    subgraph Banco_e_Auth ["Dados e Serviços (Supabase)"]
        DB["PostgreSQL Database<br>(Laudos, Lojas, Dispositivos)"]
        Auth["Auth Service<br>(Validação JWT / Perfis)"]
    end

    Client -->|1. HTTPS Request com Assinatura| WAF
    Browser -->|2. HTTPS Acesso Web| WAF
    
    WAF -->|Roteia Portal e Laudos| StaticSite
    WAF -->|Roteia endpoints /api/*| API
    
    StaticSite -->|Fetch de dados do laudo| API
    
    API -->|Conexão TCP Segura SQL| DB
    API -->|Verificação de JWT| Auth

    style Camada_Borda fill:#F59E0B,stroke:#D97706,stroke-width:1px,color:#fff
    style Hospedagem_Frontend fill:#2563EB,stroke:#1E40AF,stroke-width:1px,color:#fff
    style Hospedagem_Backend fill:#7C3AED,stroke:#5B21B6,stroke-width:1px,color:#fff
    style Banco_e_Auth fill:#10B981,stroke:#047857,stroke-width:1px,color:#fff
    style Client fill:#374151,stroke:#1F2937,stroke-width:1px,color:#fff
    style Browser fill:#374151,stroke:#1F2937,stroke-width:1px,color:#fff
```

---

## 2. Detalhamento dos Provedores e Escolhas Técnicas

A escolha dos provedores de nuvem foi feita pensando em **Custo Inicial Zero**, escalabilidade automática e facilidade de manutenção para uma equipe enxuta.

### A) Segurança e Borda: Cloudflare
* **Função:** Gerenciar o DNS, prover SSL/TLS automático, mitigar ataques DDoS e aplicar regras de WAF (Web Application Firewall) para bloquear bots que tentem escaneamentos massivos de laudos públicos.
* **Justificativa:** Plano gratuito extremamente robusto que blinda nossa API contra ataques mal-intencionados.

### B) Hospedagem Frontend: Vercel
* **Função:** Hospedar o portal institucional, formulários de lista de esperas B2B e o leitor dinâmico do Laudo Web (`ireport.app/laudo/[id]`).
* **Justificativa:** Deploy contínuo integrado ao GitHub, CDN global nativa (carregamento do laudo em milissegundos) e custos iniciais zerados (plano Hobby/Pro com generosos limites).

### C) Hospedagem Backend API: Render ou AWS App Runner
* **Função:** Hospedar a API FastAPI em Python empacotada em um container Docker.
* **Justificativa:** O Render oferece hospedagem simplificada de containers com SSL automático e deploy via Git. A API realiza operações leves (validação de assinatura SHA-256 e gravação de banco), demandando pouca memória RAM (containers de 512MB de RAM são suficientes para o MVP).

### D) Backend as a Service (BaaS): Supabase
O Supabase atua como nossa infraestrutura servidora de dados integrada:
1. **Banco de Dados (PostgreSQL):** Banco de dados relacional principal que suporta o diagrama de tabelas DDL modelado no PRD.
2. **Auth (GoTrue):** Resolve toda a autenticação de lojistas por JWT de forma segura e nativa, reduzindo o código necessário na API FastAPI.
