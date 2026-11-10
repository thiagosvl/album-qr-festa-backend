import type { FestaEventoMidia } from "../database.js";

export interface MidiaResponseDto extends FestaEventoMidia {
  url_publica: string;
  url_miniatura: string;
}

export interface ListaMidiasPaginadaDto {
  itens: MidiaResponseDto[];
  proximo_cursor: string | null;
  tem_mais: boolean;
}

export interface ItemManifestoDownloadDto {
  id: string;
  nome_arquivo: string;
  url_publica: string;
  autor: string | null;
  created_at: string;
}

export interface ManifestoDownloadEventoDto {
  slug: string;
  titulo: string;
  total: number;
  itens: ItemManifestoDownloadDto[];
}
