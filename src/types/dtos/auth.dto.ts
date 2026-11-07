import type { FestaTipoPerfilEnum } from "../database.js";

export interface SolicitarRecuperacaoResponseDto {
  email_mascarado: string;
  enviado_por_email: boolean;
  codigo_dev?: string;
}

export interface ValidarCodigoRecuperacaoResponseDto {
  recovery_id: string;
}

export interface ResetarSenhaRecuperacaoResponseDto {
  session: {
    access_token: string;
    refresh_token: string;
  };
  tipo_perfil: FestaTipoPerfilEnum;
}
