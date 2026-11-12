import type { FestaEventoConfirmacao } from "../database.js";

export interface ConvitePublicoResponseDto {
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
  inclui_galeria: boolean;
  inclui_convite: boolean;
  is_demo: boolean;
  convite_texto_chamada: string | null;
  convite_foto_url: string | null;
  convite_banner_topo_url: string | null;
  convite_musica_url: string | null;
  convite_audio_obrigado_url: string | null;
  convite_horario_inicio: string | null;
  convite_horario_texto: string | null;
  convite_nome_local: string | null;
  convite_endereco: string | null;
  convite_exibir_presentes: boolean;
  convite_titulo_tamanhos: string | null;
  convite_tamanho_calcado: string | null;
  convite_tamanho_roupa: string | null;
  convite_ideias_presentes: string[];
  convite_texto_prazo_rsvp: string | null;
  convite_whatsapp_contato: string | null;
}

export interface ListaConfirmacoesEventoDto {
  total_pessoas: number;
  total_adultos: number;
  total_criancas: number;
  total_grupos: number;
  confirmacoes: FestaEventoConfirmacao[];
}
