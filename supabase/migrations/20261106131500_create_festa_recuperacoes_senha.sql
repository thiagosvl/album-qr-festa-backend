CREATE TABLE IF NOT EXISTS public.festa_recuperacoes_senha (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.festa_usuarios(id) ON DELETE CASCADE,
  codigo text NOT NULL,
  usado boolean NOT NULL DEFAULT false,
  expira_em timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_festa_recuperacoes_senha_usuario_id
  ON public.festa_recuperacoes_senha(usuario_id);

CREATE INDEX IF NOT EXISTS idx_festa_recuperacoes_senha_codigo
  ON public.festa_recuperacoes_senha(usuario_id, codigo, usado);

ALTER TABLE public.festa_recuperacoes_senha ENABLE ROW LEVEL SECURITY;
