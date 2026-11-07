UPDATE public.festa_evento_midias
SET status_moderacao = 'OCULTA',
    fixada_demo = false
WHERE path IN (
  'demo/midias/foto-demo-1.jpg',
  'demo/midias/foto-demo-2.png',
  'demo/midias/foto-demo-3.png'
);
