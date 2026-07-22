FROM ubuntu:22.04

LABEL maintainer="Gustavo Bueno"
LABEL description="Build environment for iReport Tauri Desktop application"

ENV DEBIAN_FRONTEND=noninteractive

# Dependências do sistema
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    pkg-config \
    file \
    libssl-dev \
    ca-certificates \
    libwebkit2gtk-4.1-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libglib2.0-dev \
    && rm -rf /var/lib/apt/lists/*

# Dependências de runtime do Chromium (Playwright) — instaladas aqui (build da
# imagem, como root) porque em tempo de pipeline o container roda como usuário
# não-root e não consegue rodar apt-get install.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnspr4 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    libx11-6 \
    libxcb1 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Instala Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs \
    && npm install -g npm

# Configuração do Rust
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:${PATH}

# Instala Rust — versão FIXA (não "stable" flutuante). Cargo.lock atual exige
# rustc >= 1.88 (darling, plist, time). Fixar evita que um rebuild da imagem
# troque o compilador silenciosamente e invalide o cache de `target/` do
# Cargo (sensível à versão exata do rustc) numa pipeline que nem mudou de
# dependência — o build simplesmente recompila tudo do zero sem aviso.
RUN curl --proto '=https' \
    --tlsv1.2 \
    -sSf https://sh.rustup.rs \
    | sh -s -- -y --default-toolchain 1.97.1 \
    && rustup component add clippy

# Validação das ferramentas instaladas
RUN node --version && \
    npm --version && \
    rustc --version && \
    cargo --version

WORKDIR /app

CMD ["bash"]