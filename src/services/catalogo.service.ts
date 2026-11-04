import { supabaseAdmin } from "../config/supabase.js";
import { FESTA_TABLES } from "../constants/festa.enum.js";
import { messages } from "../constants/messages.js";
import { AppError } from "../errors/AppError.js";
import type {
  AtualizarPacoteB2cInput,
  SalvarExtraB2cInput,
  SalvarTemaCatalogoInput,
} from "../schemas/catalogo.schema.js";
import type {
  FestaCatalogoExtraB2c,
  FestaCatalogoPacoteB2c,
  FestaTemaCatalogo,
} from "../types/database.js";
import type { CatalogoPublicoResponseDto } from "../types/dtos/catalogo.dto.js";

export class CatalogoService {
  async obterCatalogoPublico(): Promise<CatalogoPublicoResponseDto> {
    const [pacotesRes, extrasRes, temasRes, planosB2bRes] = await Promise.all([
      supabaseAdmin
        .from(FESTA_TABLES.CATALOGO_PACOTES_B2C)
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true }),
      supabaseAdmin
        .from(FESTA_TABLES.CATALOGO_EXTRAS_B2C)
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true }),
      supabaseAdmin
        .from(FESTA_TABLES.TEMAS_CATALOGO)
        .select("*")
        .eq("ativo", true)
        .eq("publico", true)
        .order("ordem", { ascending: true }),
      supabaseAdmin
        .from(FESTA_TABLES.CATALOGO_PLANOS_B2B)
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true }),
    ]);

    if (pacotesRes.error) throw new AppError(pacotesRes.error.message, 500);
    if (extrasRes.error) throw new AppError(extrasRes.error.message, 500);
    if (temasRes.error) throw new AppError(temasRes.error.message, 500);
    if (planosB2bRes.error) throw new AppError(planosB2bRes.error.message, 500);

    return {
      pacotes_b2c: pacotesRes.data,
      extras_b2c: extrasRes.data,
      temas: temasRes.data,
      planos_b2b: planosB2bRes.data,
    };
  }

  async listarCatalogoAdmin(): Promise<CatalogoPublicoResponseDto> {
    const [pacotesRes, extrasRes, temasRes, planosB2bRes] = await Promise.all([
      supabaseAdmin
        .from(FESTA_TABLES.CATALOGO_PACOTES_B2C)
        .select("*")
        .order("ordem", { ascending: true }),
      supabaseAdmin
        .from(FESTA_TABLES.CATALOGO_EXTRAS_B2C)
        .select("*")
        .order("ordem", { ascending: true }),
      supabaseAdmin
        .from(FESTA_TABLES.TEMAS_CATALOGO)
        .select("*")
        .order("ordem", { ascending: true }),
      supabaseAdmin
        .from(FESTA_TABLES.CATALOGO_PLANOS_B2B)
        .select("*")
        .order("ordem", { ascending: true }),
    ]);

    if (pacotesRes.error) throw new AppError(pacotesRes.error.message, 500);
    if (extrasRes.error) throw new AppError(extrasRes.error.message, 500);
    if (temasRes.error) throw new AppError(temasRes.error.message, 500);
    if (planosB2bRes.error) throw new AppError(planosB2bRes.error.message, 500);

    return {
      pacotes_b2c: pacotesRes.data,
      extras_b2c: extrasRes.data,
      temas: temasRes.data,
      planos_b2b: planosB2bRes.data,
    };
  }

  async atualizarPacoteB2c(
    id: string,
    input: AtualizarPacoteB2cInput
  ): Promise<FestaCatalogoPacoteB2c> {
    const { data, error } = await supabaseAdmin
      .from(FESTA_TABLES.CATALOGO_PACOTES_B2C)
      .update(input)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError(messages.catalogo.pacoteNaoEncontrado, 404);
    return data;
  }

  async criarExtraB2c(input: SalvarExtraB2cInput): Promise<FestaCatalogoExtraB2c> {
    const { data, error } = await supabaseAdmin
      .from(FESTA_TABLES.CATALOGO_EXTRAS_B2C)
      .insert(input)
      .select("*")
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async atualizarExtraB2c(
    id: string,
    input: Partial<SalvarExtraB2cInput>
  ): Promise<FestaCatalogoExtraB2c> {
    const { data, error } = await supabaseAdmin
      .from(FESTA_TABLES.CATALOGO_EXTRAS_B2C)
      .update(input)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw new AppError(error.message, 400);
    if (!data) throw new AppError(messages.catalogo.extraNaoEncontrado, 404);
    return data;
  }

  async criarTemaCatalogo(input: SalvarTemaCatalogoInput): Promise<FestaTemaCatalogo> {
    const { data, error } = await supabaseAdmin
      .from(FESTA_TABLES.TEMAS_CATALOGO)
      .insert(input)
      .select("*")
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async atualizarTemaCatalogo(
    id: string,
    input: Partial<SalvarTemaCatalogoInput>
  ): Promise<FestaTemaCatalogo> {
    const { data, error } = await supabaseAdmin
      .from(FESTA_TABLES.TEMAS_CATALOGO)
      .update(input)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw new AppError(error.message, 400);
    if (!data) throw new AppError(messages.catalogo.temaNaoEncontrado, 404);
    return data;
  }
}

export const catalogoService = new CatalogoService();
