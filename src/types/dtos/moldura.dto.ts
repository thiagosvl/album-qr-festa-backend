import type { FestaEventoMoldura } from "../database.js";

export interface MolduraResponseDto extends FestaEventoMoldura {
  arquivo_url: string;
}
