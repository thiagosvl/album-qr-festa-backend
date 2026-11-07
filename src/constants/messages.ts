export const messages = {
  auth: {
    tokenAusente: "Token de autenticação ausente ou inválido.",
    tokenInvalido: "Sessão inválida ou expirada.",
    usuarioNaoEncontrado: "Perfil não registrado no Álbum QR Festa.",
    usuarioInativo: "Esta conta está inativa.",
    acessoRestritoAdmin: "Acesso restrito a administradores da plataforma.",
    acessoRestritoParceiro: "Acesso restrito a parceiros B2B credenciados.",
    parceiroInativo: "A conta deste parceiro B2B está inativa.",
    eventoNaoPertenceAoParceiro:
      "Você não tem permissão para acessar ou alterar este evento.",
    emailAcessoEmUso:
      "Este e-mail já está em uso por outra conta no sistema.",
    contaRecuperacaoNaoEncontrada:
      "Nenhuma conta ativa encontrada com o e-mail ou CPF/CNPJ informado.",
    emailAusenteParaRecuperacao:
      "Esta conta não possui um e-mail cadastrado. Solicite apoio ao suporte para atualizar seu cadastro.",
    cooldownRecuperacao:
      "Por favor, aguarde 1 minuto antes de solicitar um novo código.",
    codigoRecuperacaoInvalido:
      "Código inválido ou expirado. Verifique os 6 dígitos digitados.",
    sessaoRecuperacaoExpirada:
      "Sessão de recuperação expirada. Inicie o processo novamente.",
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
