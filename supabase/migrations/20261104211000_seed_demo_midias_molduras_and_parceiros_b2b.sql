UPDATE public.festa_eventos
SET
  data_evento = COALESCE(data_evento, '2026-12-18'::date),
  capa_url = COALESCE(
    capa_url,
    'https://fotos.festalgia.com.br/demo/midias/capa-demo.jpg'
  )
WHERE slug = 'demo';

INSERT INTO public.festa_evento_molduras (evento_id, nome, arquivo_path, ordem, ativa)
SELECT
  ev.id,
  'Balões de Festa',
  'demo/molduras/moldura-baloes.png',
  4,
  true
FROM public.festa_eventos ev
WHERE ev.slug = 'demo'
  AND NOT EXISTS (
    SELECT 1
    FROM public.festa_evento_molduras m
    WHERE m.evento_id = ev.id
      AND m.arquivo_path = 'demo/molduras/moldura-baloes.png'
  );

INSERT INTO public.festa_evento_midias (
  evento_id,
  moldura_id,
  tipo_midia,
  path,
  thumb_path,
  autor,
  status_moderacao,
  curtidas,
  fixada_demo
)
SELECT
  ev.id,
  (SELECT m.id FROM public.festa_evento_molduras m WHERE m.evento_id = ev.id ORDER BY m.ordem ASC LIMIT 1),
  'FOTO'::public.festa_tipo_midia_enum,
  v.path,
  v.thumb_path,
  v.autor,
  'APROVADA'::public.festa_status_moderacao_enum,
  v.curtidas,
  true
FROM public.festa_eventos ev
CROSS JOIN (
  VALUES
    ('demo/midias/foto-demo-1.jpg', 'demo/midias/thumbs/foto-demo-1.jpg', 'Mamãe & Papai', 14),
    ('demo/midias/foto-demo-2.png', 'demo/midias/foto-demo-2.png', 'Titia Carol', 9),
    ('demo/midias/foto-demo-3.png', 'demo/midias/foto-demo-3.png', 'Vovó Maria & Vovô João', 18)
) AS v(path, thumb_path, autor, curtidas)
WHERE ev.slug = 'demo'
  AND NOT EXISTS (
    SELECT 1
    FROM public.festa_evento_midias fm
    WHERE fm.evento_id = ev.id
      AND fm.path = v.path
  );

UPDATE public.festa_temas_catalogo
SET
  moldura_preview_url = 'https://fotos.festalgia.com.br/demo/molduras/moldura-jardim.png',
  thumb_url = 'https://fotos.festalgia.com.br/demo/midias/capa-demo.jpg'
WHERE slug = 'jardim-encantado';

UPDATE public.festa_temas_catalogo
SET
  moldura_preview_url = 'https://fotos.festalgia.com.br/demo/molduras/moldura-estrelas.png'
WHERE slug IN ('aventura-espacial', 'quinze-anos-estrelado');

UPDATE public.festa_temas_catalogo
SET
  moldura_preview_url = 'https://fotos.festalgia.com.br/demo/molduras/moldura-coracoes.png'
WHERE slug IN ('safari-baby', 'casamento-classico');

INSERT INTO public.festa_parceiros_b2b (
  nome_empresa,
  documento,
  telefone,
  email,
  cor_marca,
  status_assinatura,
  plano_b2b_id,
  saldo_creditos,
  ativo
)
SELECT
  'Buffet Castelo Mágico Kids',
  '34.567.890/0001-12',
  '11988887777',
  'contato@castelomagico.com.br',
  '#7c3aed',
  'ATIVA'::public.festa_status_assinatura_b2b_enum,
  (SELECT id FROM public.festa_catalogo_planos_b2b WHERE slug = 'parceiro-pro' LIMIT 1),
  18,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.festa_parceiros_b2b WHERE email = 'contato@castelomagico.com.br'
);

INSERT INTO public.festa_parceiros_b2b (
  nome_empresa,
  documento,
  telefone,
  email,
  cor_marca,
  status_assinatura,
  plano_b2b_id,
  saldo_creditos,
  ativo
)
SELECT
  'Estúdio Lumina Fotografia & Eventos',
  '19.234.567/0001-88',
  '11977776666',
  'estudio@luminafoto.com.br',
  '#e11d48',
  'ATIVA'::public.festa_status_assinatura_b2b_enum,
  (SELECT id FROM public.festa_catalogo_planos_b2b WHERE slug = 'parceiro-start' LIMIT 1),
  6,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.festa_parceiros_b2b WHERE email = 'estudio@luminafoto.com.br'
);

INSERT INTO public.festa_transacoes_creditos_b2b (
  parceiro_id,
  tipo,
  quantidade,
  observacao
)
SELECT
  p.id,
  'RECARGA_PLANO'::public.festa_tipo_transacao_credito_enum,
  20,
  'Recarga mensal automática — Plano Buffet & Salão Pro (20 créditos)'
FROM public.festa_parceiros_b2b p
WHERE p.email = 'contato@castelomagico.com.br'
  AND NOT EXISTS (
    SELECT 1 FROM public.festa_transacoes_creditos_b2b t WHERE t.parceiro_id = p.id
  );
