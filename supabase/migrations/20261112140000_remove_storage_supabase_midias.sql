-- O armazenamento de fotos, videos e arquivos migrou para o Cloudflare R2
-- (upload por URL assinada gerada pelo backend). Remove o acesso publico
-- ao bucket antigo do Supabase Storage, inclusive o envio anonimo.

DROP POLICY IF EXISTS festa_midias_storage_leitura_publica ON storage.objects;
DROP POLICY IF EXISTS festa_midias_storage_envio_convidado ON storage.objects;
DROP POLICY IF EXISTS festa_midias_storage_service_role ON storage.objects;

UPDATE storage.buckets
SET public = false
WHERE id = 'festa-midias';
