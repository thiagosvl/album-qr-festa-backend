import type {
  FestaCatalogoPlanoB2b,
  FestaParceiroB2b,
  FestaTemaCatalogo,
  FestaTipoPerfilEnum,
  FestaTransacaoCreditoB2b,
  FestaUsuario,
} from "../database.js";
import type { EventoAdminResponseDto } from "./evento.dto.js";

export interface ParceiroB2bAdminDto extends FestaParceiroB2b {
  plano: FestaCatalogoPlanoB2b | null;
  total_eventos: number;
  transacoes: FestaTransacaoCreditoB2b[];
  possui_login: boolean;
  email_acesso: string | null;
}

export interface PortalParceiroB2bDto {
  parceiro: ParceiroB2bAdminDto;
  perfil_usuario: FestaTipoPerfilEnum;
  planos_b2b: FestaCatalogoPlanoB2b[];
  eventos: EventoAdminResponseDto[];
  temas: FestaTemaCatalogo[];
  operadores: FestaUsuario[];
}

export interface ImpersonateParceiroResponseDto {
  tokenHash: string;
}
