-- Curtir/descurtir de forma atômica: um único UPDATE trava a linha, então
-- curtidas simultâneas nunca se perdem. A contagem nunca fica abaixo de zero.
CREATE OR REPLACE FUNCTION public.festa_ajustar_curtidas_midia(
  p_midia_id UUID,
  p_variacao INTEGER
)
RETURNS public.festa_evento_midias
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_midia public.festa_evento_midias%ROWTYPE;
BEGIN
  IF p_variacao NOT IN (-1, 1) THEN
    RAISE EXCEPTION 'Variação de curtidas inválida: %', p_variacao
      USING ERRCODE = '22023';
  END IF;

  UPDATE public.festa_evento_midias
  SET curtidas = GREATEST(0, curtidas + p_variacao)
  WHERE id = p_midia_id
  RETURNING * INTO v_midia;

  RETURN v_midia;
END;
$$;

REVOKE ALL ON FUNCTION public.festa_ajustar_curtidas_midia(UUID, INTEGER)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.festa_ajustar_curtidas_midia(UUID, INTEGER)
  TO service_role;
