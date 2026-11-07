INSERT INTO public.festa_catalogo_extras_b2c (
  slug,
  nome,
  descricao,
  preco_centavos,
  efeito_tipo,
  efeito_valor,
  ordem,
  ativo
)
VALUES (
  'videos-curtos',
  'Vídeos Curtos (Reels/Stories até 15s)',
  'Libera o envio de vídeos curtos de até 15 segundos pelos convidados no mural e telão.',
  2900,
  'LIBERAR_VIDEO',
  1,
  5,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  efeito_tipo = EXCLUDED.efeito_tipo,
  ativo = true;

UPDATE storage.buckets
SET
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf'
  ]
WHERE id = 'festa-midias';
