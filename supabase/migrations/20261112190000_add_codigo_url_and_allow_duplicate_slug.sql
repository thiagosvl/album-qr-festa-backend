ALTER TABLE public.festa_eventos
  ADD COLUMN IF NOT EXISTS codigo_url TEXT;

UPDATE public.festa_eventos
SET codigo_url = substr(replace(id::text, '-', ''), 1, 8)
WHERE codigo_url IS NULL;

ALTER TABLE public.festa_eventos
  ALTER COLUMN codigo_url SET NOT NULL,
  ALTER COLUMN codigo_url SET DEFAULT encode(extensions.gen_random_bytes(4), 'hex');

ALTER TABLE public.festa_eventos
  DROP CONSTRAINT IF EXISTS festa_eventos_slug_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_festa_eventos_codigo_url
  ON public.festa_eventos(codigo_url);
