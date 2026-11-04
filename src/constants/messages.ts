export const messages = {
  auth: {
    tokenAusente: "Token de autenticação ausente ou inválido.",
    tokenInvalido: "Sessão inválida ou expirada.",
    usuarioNaoEncontrado: "Perfil não registrado no Álbum QR Festa.",
    usuarioInativo: "Esta conta está inativa.",
    acessoRestritoAdmin: "Acesso restrito a administradores da plataforma.",
  },
  evento: {
    naoEncontrado: "Evento não encontrado.",
    inativo: "Este evento está inativo no momento.",
    expirado: "O prazo de acesso à galeria deste evento expirou.",
    slugJaExiste: "Já existe um evento cadastrado com este identificador (slug).",
    envioBloqueado: "O envio de novas fotos e vídeos foi encerrado para este evento.",
    galeriaPrivada: "A galeria deste evento é privada e exclusiva para os anfitriões.",
    tokenGestaoInvalido: "Link de gestão inválido ou expirado.",
  },
  moldura: {
    naoEncontrada: "Moldura não encontrada.",
    limiteAtingido: "O limite de molduras ativas contratadas para este evento foi atingido.",
  },
  midia: {
    naoEncontrada: "Mídia não encontrada.",
    semPermissaoExclusao: "Você só pode remover mídias enviadas pelo seu próprio aparelho.",
    videoNaoPermitido: "Este evento não possui o envio de vídeos habilitado.",
  },
  catalogo: {
    pacoteNaoEncontrado: "Pacote não encontrado no catálogo.",
    extraNaoEncontrado: "Item extra não encontrado no catálogo.",
    temaNaoEncontrado: "Tema não encontrado no catálogo.",
  },
  sistema: {
    erroValidacao: "Dados de entrada inválidos.",
    erroInterno: "Ocorreu um erro interno no servidor.",
  },
} as const;
