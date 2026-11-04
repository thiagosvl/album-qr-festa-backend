import type {
  FestaCatalogoExtraB2c,
  FestaCatalogoPacoteB2c,
  FestaCatalogoPlanoB2b,
  FestaTemaCatalogo,
} from "../database.js";

export interface CatalogoPublicoResponseDto {
  pacotes_b2c: FestaCatalogoPacoteB2c[];
  extras_b2c: FestaCatalogoExtraB2c[];
  temas: FestaTemaCatalogo[];
  planos_b2b: FestaCatalogoPlanoB2b[];
}
