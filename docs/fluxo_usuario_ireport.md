# Roteiro do Usuário e Divisão de Escopo (iReport)

Este documento define a jornada do usuário final (lojista e técnico) e delimita quais funcionalidades residem no **Aplicativo Desktop (Local)** e quais residem no **Portal Web (Nuvem)**.

---

## 1. A Divisão de Escopo: Desktop vs. Web

Para simplificar a arquitetura, o princípio de design do iReport é:
* **O App Desktop** é o "leitor físico" (Hardware Reader). Ele lê os chips e envia os dados.
* **O Portal Web** é o "cérebro administrativo" e a "vitrine de vendas" (SaaS & Report Viewer).

```
+----------------------------------------+     HTTPS / API     +-----------------------------------------+
|          DESKTOP APP (LOCAL)           |   -------------->   |            PORTAL WEB (NUVEM)           |
|                                        |                     |                                         |
| - Leitura física USB (lockdownd/ioreg) |                     | - Registro e Pagamento SaaS             |
| - Tela de login do técnico             |                     | - Painel administrativo do Lojista      |
| - Dashboard rápido de bancada          |                     | - Geração de QR Codes de vitrine        |
| - Assinatura digital do payload JSON   |                     | - Páginas públicas dos laudos para B2C  |
+----------------------------------------+                     +-----------------------------------------+
```

---

## 2. A Jornada Completa do Usuário (Fluxo Passo a Passo)

### Passo 1: Ativação da Loja (Web)
1. O dono da loja (Thiago) entra em `ireport.app` pelo navegador do computador ou celular.
2. Ele se cadastra, escolhe o plano (R$ 149/mês) e insere o pagamento.
3. Após a confirmação, o site exibe o botão **"Baixar iReport Scanner (Desktop)"** e libera a conta de acesso.

### Passo 2: Configuração da Bancada (Desktop)
1. Thiago instala o executável leve iReport Scanner no Windows ou Mac da sua bancada de testes.
2. Abre o aplicativo e faz login com a conta criada no site.
3. O app entra em tela de espera: *"Aguardando conexão USB... Conecte um iPhone ou iPad para iniciar."*

### Passo 3: Operação no Balcão (Detecção Automática e Ações)

O iReport Scanner elimina cliques desnecessários. O técnico não precisa clicar em "Iniciar Vistoria". O processo é reativo e automático:

1. O técnico conecta o iPhone/iPad via cabo USB.
2. O software Tauri detecta a conexão, executa a varredura física em background e exibe **imediatamente** o resultado da saúde das peças na tela em linguagem amigável (ex: "Bateria Saudável", "Tela Original Apple").
3. A partir dessa tela de resultados automáticos, o técnico escolhe a finalidade do laudo:

```
                  +--------------------------------+
                  |  iPhone Conectado via USB!     |
                  +--------------------------------+
                  |                                |
                  |    [ VARREDURA AUTOMÁTICA ]    |
                  |    Bateria: 91% (Saudável)     |
                  |    Tela: Original Apple        |
                  |                                |
                  |  -> [ Ação 1: Laudo de Venda ] | --> (Gera QR de Vitrine)
                  |  -> [ Ação 2: Fazer Check-in ] | --> (Entrada na Assistência)
                  |                                |
                  +--------------------------------+
```

#### 🔄 Ação 1: Gerar Laudo de Venda (Foco em Trade-In e Revenda)
* **Objetivo:** O lojista Thiago quer apenas certificar o aparelho para colocá-lo na vitrine.
* **O Fluxo:**
  1. Ao ver as informações na tela de varredura automática, Thiago clica em **"Gerar Laudo de Venda"**.
  2. O sistema envia as informações de hardware para a nuvem.
  3. O navegador abre em `ireport.app/laudo/[laudo_id]` com o laudo de originalidade público ativo, liberando o **Kit de Divulgação Digital** (QR Code de vitrine e link encurtado).

#### 🔧 Ação 2: Registrar Check-in (Foco na Ordem de Serviço da Assistência)
* **Objetivo:** O técnico Marcos está recebendo o aparelho do cliente para um conserto e quer garantir a conformidade das peças antes de abrir o celular.
* **O Fluxo:**

##### 1. O Check-in (Entrada)
1. Marcos conecta o celular na bancada e o scan automático roda em 60 segundos.
2. Ele clica em **"Registrar Check-in (Entrada)"**.
3. A API do iReport cria um laudo do tipo `manutencao` com status `em_manutencao` e salva as assinaturas de hardware de entrada (Scan A).
4. O sistema gera a página `ireport.app/status/[os_id]` e Marcos compartilha com o cliente via WhatsApp:
   * *Status:* Aparelho recebido para manutenção.
   * *Diagnóstico de Entrada:* Tela e Câmeras originais catalogadas. Bateria com desgaste (Recomenda-se Troca).
   * **O Ganho:** O cliente tem a garantia digital de que suas peças originais foram registradas antes de o técnico abrir o celular.

##### 2. The Check-out (Saída)
1. Marcos executa a troca de bateria na bancada.
2. Antes de entregar, ele pluga o celular novamente no USB do computador e clica em **"Registrar Check-out (Saída)"**.
3. O software executa o novo scan (Scan B) e compara com o Scan A.
4. A API atualiza o status do laudo para `concluido` e a página pública do cliente exibe o histórico final de manutenção:
   * *Status:* Pronto para retirada.
   * *Histórico:* Bateria antiga substituída por bateria homologada de 0 ciclos. Tela, Câmeras e Sensores originais preservados com sucesso.
   * **O Ganho:** O cliente recebe o celular, vê o certificado de serviço digital, e a assistência fica imune a reclamações de "peças trocadas".
