UPDATE festa_catalogo_pacotes_b2c
SET descricao = 'Experiência completa com até 4 molduras exclusivas, arte do QR Code de mesa no tema da festa e telão ao vivo.'
WHERE descricao LIKE '%Slideshow%';

UPDATE festa_catalogo_extras_b2c
SET descricao = 'Libere o telão ao vivo, com as fotos passando em tela cheia na TV ou no projetor.'
WHERE descricao LIKE '%Slideshow%';

UPDATE festa_catalogo_extras_b2c
SET descricao = 'Deixe a galeria no ar por mais 365 dias, com as fotos disponíveis para ver e baixar.'
WHERE descricao LIKE 'Estenda o acesso e download%';

UPDATE festa_catalogo_extras_b2c
SET descricao = 'Arte vertical combinando com a identidade visual das molduras para enviar no WhatsApp.'
WHERE descricao LIKE 'Arte vertical em alta resolução%';
