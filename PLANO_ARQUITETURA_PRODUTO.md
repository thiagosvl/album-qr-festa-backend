# Festalgia — Documento Mestre de Negócio, Arquitetura e Plano de Execução

> **Status:** Alinhado e aprovado em 04/11/2026.  
> **Objetivo deste documento:** Servir como fonte única da verdade (Single Source of Truth) para os chats de desenvolvimento no Antigravity fora do workspace do VAN 360.

---

## 1. Visão do Produto e Modelo de Negócio

**Festalgia** é uma plataforma SaaS (B2C e B2B) de álbum de fotos e vídeos ao vivo por QR Code para festas infantis, 15 anos, casamentos e eventos corporativos/sociais.

### 1.1 Referência Funcional (Piloto Existente)
- **Repositório do Piloto:** `c:\Users\thiag\Desktop\PROJETOS\galeria-festa`
- **REGRA DE PROTEÇÃO DO PILOTO:** O código estático do piloto (`index.html`, `app.js`, `style.css`, `config.js`) e as duas tabelas `evt_eventos` e `evt_fotos` no Supabase (`van-360-dev`) **NÃO devem ser alterados nem removidos**, pois serão usados na festa real das primas (`anna-clara-e-anna-luiza`) em **18/12/2026**.
- O produto comercial será construído em **3 novos repositórios independentes**, reaproveitando os comportamentos validados no piloto (câmera ao vivo com moldura sobreposta, fallback câmera nativa, tratamento EXIF, geração dupla de imagem `1080x1920` + miniatura `360x640` no cliente, zoom/pinça no canvas, truque de pré-carregamento do `File` no iOS Safari para `navigator.share`, Realtime + polling de 30s).

### 1.2 Decisões de Negócio Consolidadas
1. **Dois Canais de Venda (Catálogos Separados no Banco):**
   - **B2C (Pais / Anfitriões):** Compra avulsa por evento (`Pacote Básico` ou `Pacote Completo`) + opcionais avulsos (`Extras / Add-ons` como Convite Digital, +1 Ano de Galeria, Moldura Extra, Vídeos). Venda assistida via WhatsApp inicialmente, com pagamento via Pix (baixa manual no painel + integração com **Efí Bank / FBank** e webhook herdada do VAN 360).
   - **B2B (Fotógrafos, Buffets, Salões de Festa, Cerimonialistas):** Assinatura de planos mensais de créditos ou pacotes de créditos + compra de crédito avulso excedente. O modelo B2B também diferencia o custo entre um evento Básico e um evento Completo (via peso de créditos ou tabela de preço B2B dedicada).
   - **Foco do MVP (Semanas 1 a 4):** Operação 100% focada em validar vendas B2C no WhatsApp, mas com a **casca arquitetural e tabelas do B2B já criadas no banco de dados** (multi-tenant via `parceiro_id`).
2. **Produção e Upload de Molduras / Temas:**
   - Inicialmente as artes e molduras (`1080x1920` PNG transparente) serão geradas manualmente via IA pelo Thiago e subidas pelo Painel Admin.
   - O sistema permitirá upload flexível de molduras no evento (com validação de formato PNG e proporção), tanto pelo Admin quanto futuramente pelo Parceiro B2B.
   - **Propriedade do Tema (`festa_temas_catalogo`):** Temas produzidos pela plataforma são públicos (`publico = true`, `parceiro_proprietario_id = NULL`). Caso um parceiro B2B suba uma arte/tema próprio no futuro, fica vinculado ao `parceiro_proprietario_id` dele (`publico = false`) para que não seja comercializado para outros clientes.
3. **Experiência na Câmera e Revisão do Convidado:**
   - O seletor de molduras sempre terá como **1ª opção `"Sem moldura"`**, seguida das molduras ativas do evento.
   - O convidado pode escolher a moldura antes de bater a foto ou trocar na tela de revisão.
   - Na revisão e no visualizador, além do botão **Compartilhar** (Web Share API nativa), haverá botão explícito de **Salvar Foto** no celular.
   - Campo opcional **"Seu nome (opcional)"** mantido.
4. **Visibilidade, Moderação e Controles do Evento:**
   - **Galeria Pública vs Modo Privado (`galeria_publica`):** Padrão `true` (todos que escaneiam o QR Code veem as fotos uns dos outros, que é o grande atrativo social). Se `false`, o convidado tira, salva/compartilha a própria foto e envia para o evento, mas só o anfitrião/admin visualiza a galeria completa.
   - **Moderação em Tempo Real vs Aprovação Prévia (`moderacao_previa`):** Padrão `false` (fotos entram como `APROVADA` direto no ar e no telão, podendo ser ocultadas em tempo real pelo pai ou admin). Se `true` (ex: festas formais/gala), fotos entram como `PENDENTE` e só aparecem na galeria/telão após aprovação.
   - **Janela de Upload (`permite_envio_midias`):** Flag manual (`true` por padrão) que o pai ou admin pode desligar após a festa para encerrar novos envios mantendo a galeria aberta apenas para visualização e download até expirar.
5. **Briefing e Gestão do Pai (Híbrido sem Fricção):**
   - Cada evento possui um `token_gestao` único (link direto secreto, sem exigir que o pai crie conta/senha no MVP, embora o cadastro do pai já fique salvo em `festa_usuarios` com CPF/Telefone para futuro login caso desejado).
   - Se o pai for leigo, o próprio Admin preenche o briefing, sobe as molduras e gerencia tudo. Se o pai for desenrolado, recebe o link de gestão (`/gestao/:token`) para preencher briefing, moderar fotos em tempo real, travar uploads e baixar o `.ZIP` das fotos.
6. **Telão / Mural Ao Vivo (`/telao/:slug` — Exclusivo Pacote Completo):**
   - Aberto no computador/TV do salão: exibe o **Mural Completo (Galeria)** atualizando em tempo real.
   - Ao clicar na primeira mídia ou no botão **"Iniciar Slideshow em Tela Cheia"**, entra em modo Fullscreen passando automaticamente as mídias verticais a cada X segundos (e quando houver vídeo no futuro, reproduz o vídeo uma vez sem loop e avança para o próximo item).
7. **Suporte Futuro a Vídeo (`festa_evento_midias`):**
   - A tabela de mídias já nasce preparada para `FOTO` e `VIDEO` (`tipo_midia`, `duracao_segundos`, `tamanho_bytes`), começando com fotos no lançamento.

---

## 2. Arquitetura dos 3 Repositórios (Padrão VAN 360 Enxuto)

Seguimos integralmente o **Global Rules Config** do VAN 360 / Embu Express, removendo dependências desnecessárias (sem Capacitor/Android, sem Leaflet, sem Recharts pesados):

1. **`c:\Users\thiag\Desktop\PROJETOS\album-qr-festa-backend`**
   - **Stack:** Node.js + Fastify + TypeScript + Zod + Pino + `@supabase/supabase-js` (`SupabaseClient<Database>`) + Integração Pix Efí Bank.
   - **Padrão:** `Routes` $\rightarrow$ `Controllers (Thin)` $\rightarrow$ `Services (Fat, máx 350-400 linhas)` $\rightarrow$ `Supabase Admin / DTOs`.
   - **Migrations:** Exclusivamente em `album-qr-festa-backend/supabase/migrations/YYYYMMDDHHMMSS_nome.sql`.
2. **`c:\Users\thiag\Desktop\PROJETOS\album-qr-festa`**
   - **Stack:** React 18 + Vite + TypeScript + Tailwind CSS + Shadcn/Radix UI + TanStack React Query + React Hook Form + Zod + Lucide React + `qrcode`.
   - **Padrão Rigoroso:**
     - 4 camadas de Hooks em `src/hooks/`: `api/`, `business/`, `ui/` (ViewModels), `form/`.
     - Diálogos com sufixo `*Dialog.tsx` construídos sobre `BaseDialog`, registrados e abertos via `useLayout().openDialog(...)` e fechados exclusivamente com `safeCloseDialog(...)`.
     - Avisos contextuais usando obrigatoriamente `<Banner />`.
     - Chaves de storage centralizadas em `STORAGE_KEYS` (`src/constants/index.ts`).
     - Teto de 350–400 linhas por arquivo de componente/página.
   - **Rotas principais:**
     - `/e/:slug` (App do Convidado Mobile-First + suporte ao evento Demo)
     - `/telao/:slug` (Mural + Slideshow Fullscreen em Tempo Real)
     - `/gestao/:token` (Painel/Link de Gestão e Briefing do Pai)
     - `/admin/*` (Painel Interno de Operação: Pedidos, Status Pix, Eventos, Upload de Molduras, Catálogo de Temas e Pacotes)
     - `/parceiro/*` (Casca reservada para o futuro Painel B2B)
3. **`c:\Users\thiag\Desktop\PROJETOS\album-qr-festa-site`**
   - **Stack:** Astro + Tailwind CSS + Lucide Astro (mesmo modelo do `van360-site`).
   - **Papel:** Landing Page de alta conversão para tráfego pago (Reels/Ads), buscando os pacotes e preços dinamicamente no backend, oferecendo botão para testar a Galeria Demo ao vivo e CTA para fechar no WhatsApp.

---

## 3. Banco de Dados (Supabase `van-360-dev` com Prefixo `festa_`)

- **Projeto Supabase inicial (Validação Custo Zero):** `van-360-dev` (`project_id: jztyffakurtekwxurclw`).
- **Isolamento:** Todas as novas tabelas usam o prefixo **`festa_`** e bucket **`festa-midias`**, mantendo total isolamento das tabelas `evt_eventos` e `evt_fotos` do piloto e facilitando futura migração para instância dedicada.

### 3.1 Enums do Banco (`festa_*`)
- `festa_tipo_perfil_enum`: `'ADMIN'`, `'ANFITRIAO'`, `'PARCEIRO_ADMIN'`, `'PARCEIRO_OPERADOR'`
- `festa_pacote_tipo_enum`: `'BASICO'`, `'COMPLETO'`
- `festa_status_pedido_enum`: `'AGUARDANDO_SINAL'`, `'SINAL_PAGO'`, `'AGUARDANDO_BRIEFING'`, `'EM_MONTAGEM'`, `'ENTREGUE'`, `'PAGO_COMPLETO'`, `'CANCELADO'`
- `festa_tipo_midia_enum`: `'FOTO'`, `'VIDEO'`
- `festa_status_moderacao_enum`: `'APROVADA'`, `'PENDENTE'`, `'OCULTA'`
- `festa_status_assinatura_b2b_enum`: `'TRIAL'`, `'ATIVA'`, `'INADIMPLENTE'`, `'CANCELADA'`
- `festa_tipo_transacao_credito_enum`: `'RECARGA_PLANO'`, `'COMPRA_AVULSA'`, `'CONSUMO_EVENTO'`, `'ESTORNO'`

### 3.2 Tabelas (`festa_*`)
1. **`festa_parceiros_b2b` (Casca B2B):**
   - `id` (UUID PK), `nome_empresa`, `documento` (CPF/CNPJ), `telefone`, `email`, `logo_url`, `cor_marca`, `status_assinatura` (`festa_status_assinatura_b2b_enum`), `plano_b2b_id`, `saldo_creditos` (int), `ativo` (bool), `created_at`, `updated_at`.
2. **`festa_usuarios`:**
   - `id` (UUID PK), `auth_user_id` (UUID opcional FK `auth.users`), `parceiro_id` (UUID opcional FK `festa_parceiros_b2b` — `NULL` quando cliente direto B2C), `nome`, `telefone`, `cpf`, `email`, `tipo_perfil` (`festa_tipo_perfil_enum`), `ativo` (bool), `created_at`, `updated_at`.
3. **`festa_catalogo_pacotes_b2c`:**
   - `id` (UUID PK), `tipo_pacote` (`festa_pacote_tipo_enum` UNIQUE), `nome_exibicao`, `descricao`, `preco_centavos`, `preco_ancora_centavos` (para exibir "de R$ X por R$ Y"), `limite_molduras` (int), `inclui_qr_tematico` (bool), `inclui_telao` (bool), `dias_galeria_ativa` (int, default 90), `permite_video` (bool, default false), `ordem` (int), `ativo` (bool), `created_at`, `updated_at`.
4. **`festa_catalogo_extras_b2c`:**
   - `id` (UUID PK), `slug` (UNIQUE), `nome`, `descricao`, `preco_centavos`, `ativo` (bool), `ordem` (int), `created_at`.
5. **`festa_catalogo_planos_b2b` (Casca B2B):**
   - `id` (UUID PK), `slug` (UNIQUE), `nome`, `descricao`, `preco_mensal_centavos`, `creditos_mensais` (int), `custo_creditos_basico` (int, default 1), `custo_creditos_completo` (int, default 2), `preco_credito_avulso_centavos`, `preco_unitario_basico_centavos` (opcional), `preco_unitario_completo_centavos` (opcional), `ativo` (bool), `created_at`.
6. **`festa_transacoes_creditos_b2b` (Casca B2B):**
   - `id` (UUID PK), `parceiro_id` (FK), `evento_id` (FK opcional), `tipo` (`festa_tipo_transacao_credito_enum`), `quantidade` (int), `observacao`, `created_at`.
7. **`festa_temas_catalogo`:**
   - `id` (UUID PK), `parceiro_proprietario_id` (FK opcional `festa_parceiros_b2b` — `NULL` se for tema global da plataforma), `publico` (bool, default `true`), `nome`, `slug` (UNIQUE), `categoria` (`'INFANTIL'`, `'QUINZE_ANOS'`, `'CASAMENTO'`, `'ADULTO'`, `'CORPORATIVO'`), `cor_primaria_padrao`, `cor_secundaria_padrao`, `thumb_url`, `moldura_preview_url`, `ativo` (bool), `ordem` (int), `created_at`.
8. **`festa_eventos`:**
   - `id` (UUID PK), `slug` (TEXT UNIQUE), `token_gestao` (TEXT UNIQUE — link direto de gestão do pai), `parceiro_id` (FK opcional `festa_parceiros_b2b`), `anfitriao_id` (FK opcional `festa_usuarios`), `tema_id` (FK opcional `festa_temas_catalogo`).
   - **Dados da Festa / Briefing:** `titulo`, `subtitulo`, `boas_vindas`, `nome_aniversariante`, `idade_aniversariante`, `data_evento` (DATE), `cor_primaria` (default `'#e6007e'`), `cor_secundaria` (default `'#7b3fe4'`), `capa_url`, `qr_code_pdf_url`.
   - **Comercial e Status:** `pacote` (`festa_pacote_tipo_enum`), `status_pedido` (`festa_status_pedido_enum`), `valor_total_centavos` (int), `valor_sinal_centavos` (int), `valor_pago_centavos` (int), `pix_txid` (TEXT opcional para webhook Efí Bank), `pix_copia_cola` (TEXT opcional), `observacoes_internas` (TEXT).
   - **Configurações e Flags:** `limite_molduras` (int, default 1), `inclui_telao` (bool, default false), `galeria_publica` (bool, default true), `moderacao_previa` (bool, default false), `permite_envio_midias` (bool, default true), `permite_video` (bool, default false), `tempo_slideshow_segundos` (int, default 6), `is_demo` (bool, default false), `expira_em` (TIMESTAMPTZ), `ativo` (bool, default true), `created_at`, `updated_at`.
9. **`festa_evento_molduras`:**
   - `id` (UUID PK), `evento_id` (FK `festa_eventos` ON DELETE CASCADE), `nome`, `arquivo_path` (caminho no bucket `festa-midias`), `ordem` (int), `ativa` (bool, default true), `created_at`.
10. **`festa_evento_midias`:**
    - `id` (UUID PK), `evento_id` (FK `festa_eventos` ON DELETE CASCADE), `moldura_id` (FK opcional `festa_evento_molduras` — `NULL` quando "Sem moldura"), `tipo_midia` (`festa_tipo_midia_enum`, default `'FOTO'`), `path` (arquivo principal `1080x1920`), `thumb_path` (miniatura `360x640`), `autor` (TEXT opcional), `duracao_segundos` (int opcional para vídeos), `tamanho_bytes` (int opcional), `status_moderacao` (`festa_status_moderacao_enum`, default `'APROVADA'`), `curtidas` (int, default 0), `fixada_demo` (bool, default false — fotos fixas do evento demo), `sessao_id` (TEXT opcional), `created_at`.

---

## 4. Roteiro de Execução Passo a Passo

### Etapa 1: Banco de Dados + Backend (`album-qr-festa-backend`)
1. Criar a estrutura do repositório `c:\Users\thiag\Desktop\PROJETOS\album-qr-festa-backend` nos moldes do `embu-express-backend` / `van360-backend`.
2. Criar e aplicar no Supabase (`van-360-dev` - `jztyffakurtekwxurclw`) a migration inicial contendo os Enums, as 10 tabelas `festa_*`, índices, políticas de RLS, Realtime habilitado em `festa_evento_midias` e bucket público `festa-midias` + seed inicial dos pacotes B2C (`BASICO` R$ 49, `COMPLETO` R$ 89) e 1 evento de demonstração (`is_demo = true`).
3. Gerar `src/types/database.types.ts` via MCP do Supabase.
4. Implementar os módulos do Backend (Routes + Thin Controllers + Fat Services + Schemas Zod):
   - `catalogo` (listagem pública de pacotes B2C, extras, temas e planos B2B para a Landing Page e Admin)
   - `eventos` (CRUD Admin, busca pública por `slug` para o convidado/telão, busca e atualização por `token_gestao` para o pai, alteração de status do pedido)
   - `molduras` (upload/cadastro, ordenação e ativação/exclusão de molduras de um evento)
   - `midias` (registro de foto/vídeo, listagem paginada, moderação aprovar/ocultar, geração/stream de `.ZIP` de todas as mídias do evento, limpeza automática das mídias não-fixadas do evento Demo)

### Etapa 2: Frontend App (`album-qr-festa`)
1. Criar o repositório `c:\Users\thiag\Desktop\PROJETOS\album-qr-festa` (React + Vite + Tailwind + Shadcn UI + `DESIGN.md` inicial + infraestrutura base de `LayoutContext`, `BaseDialog`, `safeCloseDialog`, `<Banner />`, `STORAGE_KEYS` e as 4 camadas de hooks).
2. Construir o **Painel Admin (`/admin`)**: gestão de pedidos/eventos, upload de molduras, status do Pix e geração do QR Code e links.
3. Construir o **App do Convidado (`/e/:slug`)**: portando toda a experiência de câmera ao vivo, seletor de molduras (com "Sem moldura" em 1º), editor canvas com pinça/zoom, botões Enviar / Salvar / Compartilhar e Galeria Realtime.
4. Construir o **Link de Gestão do Pai (`/gestao/:token`)** e o **Telão Ao Vivo (`/telao/:slug`)** (Mural + Slideshow Fullscreen automático).

### Etapa 3: Landing Page (`album-qr-festa-site`)
1. Criar o repositório `c:\Users\thiag\Desktop\PROJETOS\album-qr-festa-site` em Astro + Tailwind consumindo os preços da API, com demonstração interativa e conversão para o WhatsApp.
