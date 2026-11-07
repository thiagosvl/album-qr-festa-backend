UPDATE public.festa_evento_midias
SET fixada_demo = true
WHERE evento_id = '00000000-0000-0000-0000-000000000001'
  AND status_moderacao = 'APROVADA'
  AND path NOT IN (
    'demo/midias/foto-demo-1.jpg',
    'demo/midias/foto-demo-2.png',
    'demo/midias/foto-demo-3.png'
  );
