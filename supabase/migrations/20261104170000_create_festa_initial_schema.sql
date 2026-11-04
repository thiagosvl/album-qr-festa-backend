CREATE OR REPLACE FUNCTION public.festa_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TYPE public.festa_tipo_perfil_enum AS ENUM ('ADMIN', 'ANFITRIAO', 'PARCEIRO_ADMIN', 'PARCEIRO_OPERADOR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.festa_pacote_tipo_enum AS ENUM ('BASICO', 'COMPLETO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.festa_status_pedido_enum AS ENUM (
    'AGUARDANDO_SINAL',
    'SINAL_PAGO',
    'AGUARDANDO_BRIEFING',
    'EM_MONTAGEM',
    'ENTREGUE',
    'PAGO_COMPLETO',
    'CANCELADO'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.festa_tipo_midia_enum AS ENUM ('FOTO', 'VIDEO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.festa_status_moderacao_enum AS ENUM ('APROVADA', 'PENDENTE', 'OCULTA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.festa_status_assinatura_b2b_enum AS ENUM ('TRIAL', 'ATIVA', 'INADIMPLENTE', 'CANCELADA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.festa_tipo_transacao_credito_enum AS ENUM ('RECARGA_PLANO', 'COMPRA_AVULSA', 'CONSUMO_EVENTO', 'ESTORNO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.festa_categoria_tema_enum AS ENUM ('INFANTIL', 'QUINZE_ANOS', 'CASAMENTO', 'ADULTO', 'CORPORATIVO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.festa_efeito_extra_enum AS ENUM (
    'MOLDURA_ADICIONAL',
    'DIAS_GALERIA_ADICIONAIS',
    'LIBERAR_VIDEO',
    'LIBERAR_TELAO',
    'ENTREGAVEL_MANUAL'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.festa_metodo_pagamento_enum AS ENUM ('PIX_MANUAL', 'CARTAO_LINK', 'CORTESIA', 'CREDITO_B2B');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.festa_catalogo_planos_b2b (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco_mensal_centavos INTEGER NOT NULL DEFAULT 0,
  creditos_mensais INTEGER NOT NULL DEFAULT 0,
  custo_creditos_basico INTEGER NOT NULL DEFAULT 1,
  custo_creditos_completo INTEGER NOT NULL DEFAULT 2,
  preco_credito_avulso_centavos INTEGER NOT NULL DEFAULT 0,
  preco_unitario_basico_centavos INTEGER,
  preco_unitario_completo_centavos INTEGER,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.festa_parceiros_b2b (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_empresa TEXT NOT NULL,
  documento TEXT,
  telefone TEXT,
  email TEXT,
  logo_url TEXT,
  cor_marca TEXT DEFAULT '#7c3aed',
  status_assinatura public.festa_status_assinatura_b2b_enum NOT NULL DEFAULT 'TRIAL',
  plano_b2b_id UUID REFERENCES public.festa_catalogo_planos_b2b(id) ON DELETE SET NULL,
  saldo_creditos INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.festa_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  parceiro_id UUID REFERENCES public.festa_parceiros_b2b(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  telefone TEXT,
  cpf TEXT,
  email TEXT,
  tipo_perfil public.festa_tipo_perfil_enum NOT NULL DEFAULT 'ANFITRIAO',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.festa_catalogo_pacotes_b2c (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_pacote public.festa_pacote_tipo_enum NOT NULL UNIQUE,
  nome_exibicao TEXT NOT NULL,
  descricao TEXT,
  preco_centavos INTEGER NOT NULL,
  preco_ancora_centavos INTEGER,
  limite_molduras INTEGER NOT NULL DEFAULT 1,
  inclui_qr_tematico BOOLEAN NOT NULL DEFAULT false,
  inclui_telao BOOLEAN NOT NULL DEFAULT false,
  dias_galeria_ativa INTEGER NOT NULL DEFAULT 90,
  permite_video BOOLEAN NOT NULL DEFAULT false,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.festa_catalogo_extras_b2c (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco_centavos INTEGER NOT NULL,
  efeito_tipo public.festa_efeito_extra_enum NOT NULL DEFAULT 'ENTREGAVEL_MANUAL',
  efeito_valor INTEGER NOT NULL DEFAULT 1,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.festa_temas_catalogo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_proprietario_id UUID REFERENCES public.festa_parceiros_b2b(id) ON DELETE SET NULL,
  publico BOOLEAN NOT NULL DEFAULT true,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  categoria public.festa_categoria_tema_enum NOT NULL DEFAULT 'INFANTIL',
  cor_primaria_padrao TEXT NOT NULL DEFAULT '#e6007e',
  cor_secundaria_padrao TEXT NOT NULL DEFAULT '#7b3fe4',
  thumb_url TEXT,
  moldura_preview_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.festa_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  token_gestao TEXT NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  parceiro_id UUID REFERENCES public.festa_parceiros_b2b(id) ON DELETE SET NULL,
  anfitriao_id UUID REFERENCES public.festa_usuarios(id) ON DELETE SET NULL,
  tema_id UUID REFERENCES public.festa_temas_catalogo(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  boas_vindas TEXT,
  nome_aniversariante TEXT,
  idade_aniversariante TEXT,
  data_evento DATE,
  cor_primaria TEXT NOT NULL DEFAULT '#e6007e',
  cor_secundaria TEXT NOT NULL DEFAULT '#7b3fe4',
  capa_url TEXT,
  qr_code_pdf_url TEXT,
  pacote public.festa_pacote_tipo_enum NOT NULL DEFAULT 'BASICO',
  status_pedido public.festa_status_pedido_enum NOT NULL DEFAULT 'AGUARDANDO_SINAL',
  metodo_pagamento public.festa_metodo_pagamento_enum NOT NULL DEFAULT 'PIX_MANUAL',
  valor_pacote_centavos INTEGER NOT NULL DEFAULT 0,
  valor_extras_centavos INTEGER NOT NULL DEFAULT 0,
  desconto_centavos INTEGER NOT NULL DEFAULT 0,
  valor_total_centavos INTEGER NOT NULL DEFAULT 0,
  valor_sinal_centavos INTEGER NOT NULL DEFAULT 0,
  valor_pago_centavos INTEGER NOT NULL DEFAULT 0,
  pix_txid TEXT,
  pix_copia_cola TEXT,
  observacoes_internas TEXT,
  limite_molduras INTEGER NOT NULL DEFAULT 1,
  inclui_telao BOOLEAN NOT NULL DEFAULT false,
  galeria_publica BOOLEAN NOT NULL DEFAULT true,
  moderacao_previa BOOLEAN NOT NULL DEFAULT false,
  permite_envio_midias BOOLEAN NOT NULL DEFAULT true,
  permite_video BOOLEAN NOT NULL DEFAULT false,
  tempo_slideshow_segundos INTEGER NOT NULL DEFAULT 6,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  expira_em TIMESTAMPTZ,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.festa_transacoes_creditos_b2b (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id UUID NOT NULL REFERENCES public.festa_parceiros_b2b(id) ON DELETE CASCADE,
  evento_id UUID REFERENCES public.festa_eventos(id) ON DELETE SET NULL,
  tipo public.festa_tipo_transacao_credito_enum NOT NULL,
  quantidade INTEGER NOT NULL,
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.festa_evento_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES public.festa_eventos(id) ON DELETE CASCADE,
  extra_id UUID REFERENCES public.festa_catalogo_extras_b2c(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario_centavos INTEGER NOT NULL DEFAULT 0,
  entregue BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.festa_evento_molduras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES public.festa_eventos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  arquivo_path TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.festa_evento_midias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES public.festa_eventos(id) ON DELETE CASCADE,
  moldura_id UUID REFERENCES public.festa_evento_molduras(id) ON DELETE SET NULL,
  tipo_midia public.festa_tipo_midia_enum NOT NULL DEFAULT 'FOTO',
  path TEXT NOT NULL,
  thumb_path TEXT,
  autor TEXT,
  duracao_segundos INTEGER,
  tamanho_bytes INTEGER,
  status_moderacao public.festa_status_moderacao_enum NOT NULL DEFAULT 'APROVADA',
  curtidas INTEGER NOT NULL DEFAULT 0,
  fixada_demo BOOLEAN NOT NULL DEFAULT false,
  sessao_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_festa_eventos_slug ON public.festa_eventos(slug);
CREATE INDEX IF NOT EXISTS idx_festa_eventos_token_gestao ON public.festa_eventos(token_gestao);
CREATE INDEX IF NOT EXISTS idx_festa_eventos_status_pedido ON public.festa_eventos(status_pedido);
CREATE INDEX IF NOT EXISTS idx_festa_evento_molduras_evento_ordem ON public.festa_evento_molduras(evento_id, ordem);
CREATE INDEX IF NOT EXISTS idx_festa_evento_midias_evento_created ON public.festa_evento_midias(evento_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_festa_evento_midias_evento_moderacao ON public.festa_evento_midias(evento_id, status_moderacao);
CREATE INDEX IF NOT EXISTS idx_festa_evento_extras_evento ON public.festa_evento_extras(evento_id);

CREATE TRIGGER trg_festa_catalogo_planos_b2b_updated_at
  BEFORE UPDATE ON public.festa_catalogo_planos_b2b
  FOR EACH ROW EXECUTE FUNCTION public.festa_set_updated_at();

CREATE TRIGGER trg_festa_parceiros_b2b_updated_at
  BEFORE UPDATE ON public.festa_parceiros_b2b
  FOR EACH ROW EXECUTE FUNCTION public.festa_set_updated_at();

CREATE TRIGGER trg_festa_usuarios_updated_at
  BEFORE UPDATE ON public.festa_usuarios
  FOR EACH ROW EXECUTE FUNCTION public.festa_set_updated_at();

CREATE TRIGGER trg_festa_catalogo_pacotes_b2c_updated_at
  BEFORE UPDATE ON public.festa_catalogo_pacotes_b2c
  FOR EACH ROW EXECUTE FUNCTION public.festa_set_updated_at();

CREATE TRIGGER trg_festa_catalogo_extras_b2c_updated_at
  BEFORE UPDATE ON public.festa_catalogo_extras_b2c
  FOR EACH ROW EXECUTE FUNCTION public.festa_set_updated_at();

CREATE TRIGGER trg_festa_temas_catalogo_updated_at
  BEFORE UPDATE ON public.festa_temas_catalogo
  FOR EACH ROW EXECUTE FUNCTION public.festa_set_updated_at();

CREATE TRIGGER trg_festa_eventos_updated_at
  BEFORE UPDATE ON public.festa_eventos
  FOR EACH ROW EXECUTE FUNCTION public.festa_set_updated_at();

ALTER TABLE public.festa_catalogo_planos_b2b ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festa_parceiros_b2b ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festa_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festa_transacoes_creditos_b2b ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festa_catalogo_pacotes_b2c ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festa_catalogo_extras_b2c ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festa_temas_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festa_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festa_evento_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festa_evento_molduras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festa_evento_midias ENABLE ROW LEVEL SECURITY;

CREATE POLICY festa_pacotes_b2c_leitura_publica ON public.festa_catalogo_pacotes_b2c
  FOR SELECT TO anon, authenticated USING (ativo = true);

CREATE POLICY festa_extras_b2c_leitura_publica ON public.festa_catalogo_extras_b2c
  FOR SELECT TO anon, authenticated USING (ativo = true);

CREATE POLICY festa_planos_b2b_leitura_publica ON public.festa_catalogo_planos_b2b
  FOR SELECT TO anon, authenticated USING (ativo = true);

CREATE POLICY festa_temas_leitura_publica ON public.festa_temas_catalogo
  FOR SELECT TO anon, authenticated USING (ativo = true AND publico = true);

CREATE POLICY festa_eventos_leitura_publica ON public.festa_eventos
  FOR SELECT TO anon, authenticated USING (ativo = true);

CREATE POLICY festa_molduras_leitura_publica ON public.festa_evento_molduras
  FOR SELECT TO anon, authenticated USING (ativa = true);

CREATE POLICY festa_midias_leitura_publica ON public.festa_evento_midias
  FOR SELECT TO anon, authenticated USING (status_moderacao = 'APROVADA');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'festa-midias',
  'festa-midias',
  true,
  15728640,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY festa_midias_storage_leitura_publica ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'festa-midias');

CREATE POLICY festa_midias_storage_envio_convidado ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'festa-midias' AND name LIKE '%/midias/%');

CREATE POLICY festa_midias_storage_service_role ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id = 'festa-midias')
  WITH CHECK (bucket_id = 'festa-midias');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'festa_evento_midias'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.festa_evento_midias;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'festa_eventos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.festa_eventos;
  END IF;
END $$;

INSERT INTO public.festa_catalogo_pacotes_b2c (
  tipo_pacote, nome_exibicao, descricao, preco_centavos, preco_ancora_centavos,
  limite_molduras, inclui_qr_tematico, inclui_telao, dias_galeria_ativa, permite_video, ordem, ativo
) VALUES
  (
    'BASICO',
    'Pacote Básico',
    'Álbum digital ao vivo por QR Code com 1 moldura exclusiva no tema da festa e galeria aberta por 90 dias.',
    4900,
    7900,
    1,
    false,
    false,
    90,
    false,
    1,
    true
  ),
  (
    'COMPLETO',
    'Pacote Completo',
    'Experiência completa com até 4 molduras exclusivas, Arte de Mesa com QR Code no tema e Telão Ao Vivo com Slideshow.',
    8900,
    13900,
    4,
    true,
    true,
    90,
    false,
    2,
    true
  )
ON CONFLICT (tipo_pacote) DO NOTHING;

INSERT INTO public.festa_catalogo_extras_b2c (
  slug, nome, descricao, preco_centavos, efeito_tipo, efeito_valor, ordem, ativo
) VALUES
  (
    'moldura-extra',
    'Moldura Personalizada Extra',
    'Adicione +1 opção de moldura exclusiva no tema da sua festa.',
    1500,
    'MOLDURA_ADICIONAL',
    1,
    1,
    true
  ),
  (
    'convite-digital',
    'Arte de Convite Digital no Tema',
    'Arte vertical em alta resolução combinando com a identidade visual das molduras para enviar no WhatsApp.',
    2500,
    'ENTREGAVEL_MANUAL',
    1,
    2,
    true
  ),
  (
    'galeria-1-ano',
    'Galeria Ativa por +1 Ano',
    'Estenda o acesso e download das fotos da festa por mais 365 dias.',
    2900,
    'DIAS_GALERIA_ADICIONAIS',
    365,
    3,
    true
  ),
  (
    'telao-avulso',
    'Mural & Telão Ao Vivo',
    'Libere o modo Telão e Slideshow em tela cheia para TV ou projetor.',
    2500,
    'LIBERAR_TELAO',
    1,
    4,
    true
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.festa_catalogo_planos_b2b (
  slug, nome, descricao, preco_mensal_centavos, creditos_mensais,
  custo_creditos_basico, custo_creditos_completo, preco_credito_avulso_centavos, ordem, ativo
) VALUES
  (
    'parceiro-start',
    'Plano Parceiro Start',
    'Ideal para fotógrafos e decoradores: 6 créditos por mês (até 6 eventos Básicos ou 3 Completos).',
    14900,
    6,
    1,
    2,
    2500,
    1,
    true
  ),
  (
    'parceiro-pro',
    'Plano Buffet & Salão Pro',
    'Ideal para buffets infantis e casas de festas: 20 créditos por mês (até 20 eventos Básicos ou 10 Completos).',
    34900,
    20,
    1,
    2,
    1900,
    2,
    true
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.festa_temas_catalogo (
  publico, nome, slug, categoria, cor_primaria_padrao, cor_secundaria_padrao, ordem, ativo
) VALUES
  (true, 'Jardim Encantado & Borboletas', 'jardim-encantado', 'INFANTIL', '#e6007e', '#7b3fe4', 1, true),
  (true, 'Aventura Espacial & Astronauta', 'aventura-espacial', 'INFANTIL', '#2563eb', '#4f46e5', 2, true),
  (true, 'Safari Baby Aquarela', 'safari-baby', 'INFANTIL', '#d97706', '#059669', 3, true),
  (true, 'Noite Estrelada 15 Anos', 'quinze-anos-estrelado', 'QUINZE_ANOS', '#db2777', '#7c3aed', 4, true),
  (true, 'Casamento Clássico Floral', 'casamento-classico', 'CASAMENTO', '#be185d', '#9333ea', 5, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.festa_usuarios (auth_user_id, nome, email, tipo_perfil, ativo)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'nome', 'Administrador Álbum QR Festa'),
  u.email,
  'ADMIN'::public.festa_tipo_perfil_enum,
  true
FROM auth.users u
WHERE u.email IN ('admin@van360.com', 'thiago-svl@hotmail.com')
ON CONFLICT (auth_user_id) DO NOTHING;

INSERT INTO public.festa_eventos (
  slug, titulo, subtitulo, boas_vindas, nome_aniversariante, idade_aniversariante,
  cor_primaria, cor_secundaria, pacote, status_pedido, metodo_pagamento,
  valor_pacote_centavos, valor_total_centavos, valor_pago_centavos,
  limite_molduras, inclui_telao, galeria_publica, moderacao_previa, permite_envio_midias,
  is_demo, ativo
) VALUES (
  'demo',
  'Helena · 5 Anos',
  'Jardim Encantado da Helena',
  'Tire uma foto agora mesmo com as molduras da festa e veja aparecer ao vivo na galeria e no telão!',
  'Helena',
  '5 anos',
  '#e6007e',
  '#7c3aed',
  'COMPLETO',
  'PAGO_COMPLETO',
  'CORTESIA',
  8900,
  8900,
  8900,
  4,
  true,
  true,
  false,
  true,
  true,
  true
)
ON CONFLICT (slug) DO NOTHING;
