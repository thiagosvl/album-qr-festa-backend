DO $$ BEGIN
  CREATE TYPE public.festa_codigo_modulo_enum AS ENUM ('GALERIA', 'CONVITE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.festa_catalogo_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  codigo_modulo public.festa_codigo_modulo_enum NOT NULL UNIQUE,
  nome_exibicao TEXT NOT NULL,
  descricao TEXT,
  preco_centavos INTEGER NOT NULL DEFAULT 0,
  preco_ancora_centavos INTEGER,
  custo_creditos_b2b INTEGER NOT NULL DEFAULT 1,
  disponivel_b2b BOOLEAN NOT NULL DEFAULT true,
  limite_molduras_base INTEGER NOT NULL DEFAULT 1,
  dias_validade_base INTEGER NOT NULL DEFAULT 90,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_festa_catalogo_produtos_updated_at ON public.festa_catalogo_produtos;
CREATE TRIGGER trg_festa_catalogo_produtos_updated_at
  BEFORE UPDATE ON public.festa_catalogo_produtos
  FOR EACH ROW EXECUTE FUNCTION public.festa_set_updated_at();

ALTER TABLE public.festa_catalogo_produtos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY festa_produtos_b2c_leitura_publica ON public.festa_catalogo_produtos
    FOR SELECT TO anon, authenticated USING (ativo = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO public.festa_catalogo_produtos (
  slug,
  codigo_modulo,
  nome_exibicao,
  descricao,
  preco_centavos,
  preco_ancora_centavos,
  custo_creditos_b2b,
  disponivel_b2b,
  limite_molduras_base,
  dias_validade_base,
  ordem,
  ativo
) VALUES
  (
    'galeria',
    'GALERIA',
    'Galeria QR Code ao vivo',
    'Álbum digital ao vivo por QR Code com fotos no mural, 1 moldura exclusiva no tema da festa e galeria aberta por 90 dias.',
    4900,
    7900,
    1,
    true,
    1,
    90,
    1,
    true
  ),
  (
    'convite',
    'CONVITE',
    'Convite interativo e lista de presença',
    'Convite digital animado no tema da festa com envelope 3D, contagem regressiva, mapa (Google Maps e Waze), sugestões de presente e confirmação de presença (adultos e crianças).',
    3900,
    5900,
    1,
    true,
    0,
    90,
    2,
    true
  )
ON CONFLICT (codigo_modulo) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  descricao = EXCLUDED.descricao,
  ativo = true;

ALTER TABLE public.festa_catalogo_extras_b2c
  ADD COLUMN IF NOT EXISTS custo_creditos_b2b INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS disponivel_b2b BOOLEAN NOT NULL DEFAULT true;

UPDATE public.festa_catalogo_extras_b2c
SET ativo = false, disponivel_b2b = false
WHERE slug = 'convite-digital';

INSERT INTO public.festa_catalogo_extras_b2c (
  slug,
  nome,
  descricao,
  preco_centavos,
  custo_creditos_b2b,
  disponivel_b2b,
  efeito_tipo,
  efeito_valor,
  ordem,
  ativo
) VALUES (
  'qr-mesa-tematico',
  'Arte do QR Code de mesa no tema',
  'Arte personalizada no tema da festa pronta para imprimir e colocar nas mesas dos convidados.',
  1500,
  0,
  true,
  'ENTREGAVEL_MANUAL',
  1,
  6,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  ativo = true;

CREATE TABLE IF NOT EXISTS public.festa_evento_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES public.festa_eventos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.festa_catalogo_produtos(id) ON DELETE SET NULL,
  codigo_modulo public.festa_codigo_modulo_enum NOT NULL,
  nome TEXT NOT NULL,
  preco_centavos INTEGER NOT NULL DEFAULT 0,
  custo_creditos_b2b INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (evento_id, codigo_modulo)
);

CREATE INDEX IF NOT EXISTS idx_festa_evento_produtos_evento ON public.festa_evento_produtos(evento_id);

ALTER TABLE public.festa_evento_produtos ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.festa_evento_extras
  ADD COLUMN IF NOT EXISTS custo_creditos_b2b INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.festa_eventos
  ALTER COLUMN pacote DROP NOT NULL;

ALTER TABLE public.festa_eventos
  ADD COLUMN IF NOT EXISTS inclui_galeria BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS inclui_convite BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS creditos_b2b_consumidos INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS convite_horario_inicio TEXT,
  ADD COLUMN IF NOT EXISTS convite_horario_texto TEXT,
  ADD COLUMN IF NOT EXISTS convite_nome_local TEXT,
  ADD COLUMN IF NOT EXISTS convite_endereco TEXT,
  ADD COLUMN IF NOT EXISTS convite_texto_chamada TEXT,
  ADD COLUMN IF NOT EXISTS convite_texto_prazo_rsvp TEXT,
  ADD COLUMN IF NOT EXISTS convite_whatsapp_contato TEXT,
  ADD COLUMN IF NOT EXISTS convite_exibir_presentes BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS convite_titulo_tamanhos TEXT,
  ADD COLUMN IF NOT EXISTS convite_tamanho_calcado TEXT,
  ADD COLUMN IF NOT EXISTS convite_tamanho_roupa TEXT,
  ADD COLUMN IF NOT EXISTS convite_ideias_presentes TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS convite_foto_url TEXT,
  ADD COLUMN IF NOT EXISTS convite_banner_topo_url TEXT,
  ADD COLUMN IF NOT EXISTS convite_musica_url TEXT,
  ADD COLUMN IF NOT EXISTS convite_audio_obrigado_url TEXT;

CREATE TABLE IF NOT EXISTS public.festa_evento_confirmacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES public.festa_eventos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  adultos INTEGER NOT NULL DEFAULT 1 CHECK (adultos >= 1 AND adultos <= 30),
  criancas INTEGER NOT NULL DEFAULT 0 CHECK (criancas >= 0 AND criancas <= 30),
  nomes_adultos TEXT[] NOT NULL DEFAULT '{}',
  nomes_criancas TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_festa_evento_confirmacoes_evento_created
  ON public.festa_evento_confirmacoes(evento_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_festa_evento_confirmacoes_updated_at ON public.festa_evento_confirmacoes;
CREATE TRIGGER trg_festa_evento_confirmacoes_updated_at
  BEFORE UPDATE ON public.festa_evento_confirmacoes
  FOR EACH ROW EXECUTE FUNCTION public.festa_set_updated_at();

ALTER TABLE public.festa_evento_confirmacoes ENABLE ROW LEVEL SECURITY;

INSERT INTO public.festa_evento_produtos (
  evento_id,
  produto_id,
  codigo_modulo,
  nome,
  preco_centavos,
  custo_creditos_b2b
)
SELECT
  ev.id,
  cp.id,
  'GALERIA'::public.festa_codigo_modulo_enum,
  cp.nome_exibicao,
  ev.valor_pacote_centavos,
  cp.custo_creditos_b2b
FROM public.festa_eventos ev
CROSS JOIN public.festa_catalogo_produtos cp
WHERE cp.codigo_modulo = 'GALERIA'
ON CONFLICT (evento_id, codigo_modulo) DO NOTHING;

UPDATE public.festa_eventos
SET
  inclui_galeria = true,
  inclui_convite = true,
  data_evento = COALESCE(data_evento, '2026-12-19'),
  convite_horario_inicio = '15:00',
  convite_horario_texto = '15h às 19h',
  convite_nome_local = 'Espaço Jardim Encantado',
  convite_endereco = 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  convite_texto_chamada = 'A Helena faz 5 aninhos e quer você na festa',
  convite_texto_prazo_rsvp = 'Confirme sua presença abaixo dizendo quantos adultos e quantas crianças vão.',
  convite_exibir_presentes = true,
  convite_titulo_tamanhos = 'Tamanhos da Helena',
  convite_tamanho_calcado = '28',
  convite_tamanho_roupa = '6',
  convite_ideias_presentes = ARRAY[
    'Bonecas e acessórios',
    'Livros infantis e jogos',
    'Roupas e fantasias',
    'Kit de pintura e artes',
    'Calçados',
    'Brinquedos educativos'
  ]
WHERE slug = 'demo';

INSERT INTO public.festa_evento_produtos (
  evento_id,
  produto_id,
  codigo_modulo,
  nome,
  preco_centavos,
  custo_creditos_b2b
)
SELECT
  ev.id,
  cp.id,
  'CONVITE'::public.festa_codigo_modulo_enum,
  cp.nome_exibicao,
  cp.preco_centavos,
  cp.custo_creditos_b2b
FROM public.festa_eventos ev
CROSS JOIN public.festa_catalogo_produtos cp
WHERE ev.slug = 'demo' AND cp.codigo_modulo = 'CONVITE'
ON CONFLICT (evento_id, codigo_modulo) DO NOTHING;

INSERT INTO public.festa_evento_confirmacoes (
  evento_id,
  nome,
  adultos,
  criancas,
  nomes_adultos,
  nomes_criancas
)
SELECT
  ev.id,
  'Tia Mariana Silva',
  2,
  1,
  ARRAY['Tia Mariana Silva', 'Tio Rodrigo Silva'],
  ARRAY['Pedrinho']
FROM public.festa_eventos ev
WHERE ev.slug = 'demo'
  AND NOT EXISTS (
    SELECT 1 FROM public.festa_evento_confirmacoes c WHERE c.evento_id = ev.id
  );

INSERT INTO public.festa_evento_confirmacoes (
  evento_id,
  nome,
  adultos,
  criancas,
  nomes_adultos,
  nomes_criancas
)
SELECT
  ev.id,
  'Vovó Maria Helena',
  2,
  0,
  ARRAY['Vovó Maria Helena', 'Vovô Carlos'],
  ARRAY[]::TEXT[]
FROM public.festa_eventos ev
WHERE ev.slug = 'demo'
  AND (SELECT COUNT(*) FROM public.festa_evento_confirmacoes c WHERE c.evento_id = ev.id) = 1;
