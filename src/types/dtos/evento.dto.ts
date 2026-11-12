import type {
  FestaEvento,
  FestaEventoExtra,
  FestaEventoMoldura,
  FestaEventoProduto,
  FestaTemaCatalogo,
  FestaUsuario,
} from "../database.js";

export interface MolduraPublicaDto {
  id: string;
  nome: string;
  arquivo_path: string;
  arquivo_url: string;
  ordem: number;
  ativa: boolean;
}

export interface EventoPublicoResponseDto {
  id: string;
  codigo_url: string;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  boas_vindas: string | null;
  nome_aniversariante: string | null;
  idade_aniversariante: string | null;
  data_evento: string | null;
  cor_primaria: string;
  cor_secundaria: string;
  capa_url: string | null;
  pacote: FestaEvento["pacote"];
  inclui_galeria: boolean;
  inclui_convite: boolean;
  inclui_telao: boolean;
  galeria_publica: boolean;
  moderacao_previa: boolean;
  permite_envio_midias: boolean;
  permite_video: boolean;
  tempo_slideshow_segundos: number;
  is_demo: boolean;
  expira_em: string | null;
  galeria_expirada: boolean;
  molduras: MolduraPublicaDto[];
}

export interface EventoAdminResponseDto extends FestaEvento {
  anfitriao: FestaUsuario | null;
  tema: FestaTemaCatalogo | null;
  produtos: FestaEventoProduto[];
  extras: FestaEventoExtra[];
  molduras: MolduraPublicaDto[];
  total_midias: number;
  total_confirmados_pessoas: number;
  valor_restante_centavos: number;
}

export interface EventoGestaoResponseDto {
  evento: FestaEvento;
  anfitriao: Pick<FestaUsuario, "id" | "nome" | "telefone" | "email"> | null;
  produtos: FestaEventoProduto[];
  extras: FestaEventoExtra[];
  molduras: MolduraPublicaDto[];
  resumo_midias: {
    total: number;
    aprovadas: number;
    pendentes: number;
    ocultas: number;
  };
  resumo_confirmacoes: {
    total_pessoas: number;
    total_adultos: number;
    total_criancas: number;
    total_grupos: number;
  };
  valor_restante_centavos: number;
}
