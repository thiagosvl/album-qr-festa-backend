import { supabaseAdmin } from "../config/supabase.js";
import { FESTA_TABLES } from "../constants/festa.enum.js";
import { messages } from "../constants/messages.js";
import { AppError } from "../errors/AppError.js";
import type {
  AtualizarConfirmacaoRsvpInput,
  SalvarConfirmacaoRsvpInput,
} from "../schemas/convite.schema.js";
import type { FestaEvento, FestaEventoConfirmacao } from "../types/database.js";
import type {
  ConvitePublicoResponseDto,
  ListaConfirmacoesEventoDto,
} from "../types/dtos/convite.dto.js";
import { buscarEventoPorIdentificadorPublico } from "../utils/evento-produtos.helper.js";
import { gestaoEventoService } from "./gestao-evento.service.js";

function normalizarNomesConfirmacao(
  nomes: string[],
  quantidade: number
): string[] {
  return Array.from({ length: quantidade }, (_, idx) =>
    (nomes[idx] ?? "").trim()
  );
}

function mapearConvitePublicoDto(evento: FestaEvento): ConvitePublicoResponseDto {
  return {
    id: evento.id,
    codigo_url: evento.codigo_url,
    slug: evento.slug,
    titulo: evento.titulo,
    subtitulo: evento.subtitulo,
    boas_vindas: evento.boas_vindas,
    nome_aniversariante: evento.nome_aniversariante,
    idade_aniversariante: evento.idade_aniversariante,
    data_evento: evento.data_evento,
    cor_primaria: evento.cor_primaria,
    cor_secundaria: evento.cor_secundaria,
    capa_url: evento.capa_url,
    inclui_galeria: evento.inclui_galeria,
    inclui_convite: evento.inclui_convite,
    is_demo: evento.is_demo,
    convite_texto_chamada: evento.convite_texto_chamada,
    convite_foto_url: evento.convite_foto_url,
    convite_banner_topo_url: evento.convite_banner_topo_url,
    convite_musica_url: evento.convite_musica_url,
    convite_audio_obrigado_url: evento.convite_audio_obrigado_url,
    convite_horario_inicio: evento.convite_horario_inicio,
    convite_horario_texto: evento.convite_horario_texto,
    convite_nome_local: evento.convite_nome_local,
    convite_endereco: evento.convite_endereco,
    convite_exibir_presentes: evento.convite_exibir_presentes,
    convite_titulo_tamanhos: evento.convite_titulo_tamanhos,
    convite_tamanho_calcado: evento.convite_tamanho_calcado,
    convite_tamanho_roupa: evento.convite_tamanho_roupa,
    convite_ideias_presentes: evento.convite_ideias_presentes ?? [],
    convite_texto_prazo_rsvp: evento.convite_texto_prazo_rsvp,
    convite_whatsapp_contato: evento.convite_whatsapp_contato,
  };
}

export class ConviteService {
  private async buscarEventoPorSlugComConvite(slug: string): Promise<FestaEvento> {
    const evento = await buscarEventoPorIdentificadorPublico(slug);
    if (!evento) throw new AppError(messages.evento.naoEncontrado, 404);
    if (!evento.ativo) throw new AppError(messages.evento.inativo, 403);
    if (!evento.inclui_convite) {
      throw new AppError(messages.evento.conviteNaoContratado, 403);
    }

    return evento;
  }

  async obterConvitePublicoPorSlug(slug: string): Promise<ConvitePublicoResponseDto> {
    const evento = await this.buscarEventoPorSlugComConvite(slug);
    return mapearConvitePublicoDto(evento);
  }

  async registrarConfirmacaoPublicaPorSlug(
    slug: string,
    input: SalvarConfirmacaoRsvpInput
  ): Promise<FestaEventoConfirmacao> {
    const evento = await this.buscarEventoPorSlugComConvite(slug);
    return this.criarConfirmacaoPorEventoId(evento.id, input);
  }

  async listarConfirmacoesPorEventoId(
    eventoId: string
  ): Promise<ListaConfirmacoesEventoDto> {
    const { data, error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_CONFIRMACOES)
      .select("*")
      .eq("evento_id", eventoId)
      .order("created_at", { ascending: false });

    if (error) throw new AppError(error.message, 500);

    const confirmacoes = data ?? [];
    let totalAdultos = 0;
    let totalCriancas = 0;
    for (const c of confirmacoes) {
      totalAdultos += c.adultos;
      totalCriancas += c.criancas;
    }

    return {
      total_pessoas: totalAdultos + totalCriancas,
      total_adultos: totalAdultos,
      total_criancas: totalCriancas,
      total_grupos: confirmacoes.length,
      confirmacoes,
    };
  }

  async criarConfirmacaoPorEventoId(
    eventoId: string,
    input: SalvarConfirmacaoRsvpInput
  ): Promise<FestaEventoConfirmacao> {
    const nomesAdultos = normalizarNomesConfirmacao(
      input.nomes_adultos,
      input.adultos
    );
    const nomesCriancas = normalizarNomesConfirmacao(
      input.nomes_criancas,
      input.criancas
    );

    const { data, error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_CONFIRMACOES)
      .insert({
        evento_id: eventoId,
        nome: nomesAdultos[0] || "Convidado",
        adultos: input.adultos,
        criancas: input.criancas,
        nomes_adultos: nomesAdultos,
        nomes_criancas: nomesCriancas,
      })
      .select("*")
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async atualizarConfirmacaoPorEventoId(
    eventoId: string,
    confirmacaoId: string,
    input: AtualizarConfirmacaoRsvpInput
  ): Promise<FestaEventoConfirmacao> {
    const nomesAdultos = normalizarNomesConfirmacao(
      input.nomes_adultos,
      input.adultos
    );
    const nomesCriancas = normalizarNomesConfirmacao(
      input.nomes_criancas,
      input.criancas
    );

    const { data, error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_CONFIRMACOES)
      .update({
        nome: nomesAdultos[0] || "Convidado",
        adultos: input.adultos,
        criancas: input.criancas,
        nomes_adultos: nomesAdultos,
        nomes_criancas: nomesCriancas,
      })
      .eq("id", confirmacaoId)
      .eq("evento_id", eventoId)
      .select("*")
      .maybeSingle();

    if (error) throw new AppError(error.message, 400);
    if (!data) throw new AppError(messages.convite.confirmacaoNaoEncontrada, 404);
    return data;
  }

  async excluirConfirmacaoPorEventoId(
    eventoId: string,
    confirmacaoId: string
  ): Promise<void> {
    const { data, error } = await supabaseAdmin
      .from(FESTA_TABLES.EVENTO_CONFIRMACOES)
      .delete()
      .eq("id", confirmacaoId)
      .eq("evento_id", eventoId)
      .select("id")
      .maybeSingle();

    if (error) throw new AppError(error.message, 400);
    if (!data) throw new AppError(messages.convite.confirmacaoNaoEncontrada, 404);
  }

  async listarPorTokenGestao(token: string): Promise<ListaConfirmacoesEventoDto> {
    const evento = await gestaoEventoService.validarTokenGestao(token);
    return this.listarConfirmacoesPorEventoId(evento.id);
  }

  async criarPorTokenGestao(
    token: string,
    input: SalvarConfirmacaoRsvpInput
  ): Promise<FestaEventoConfirmacao> {
    const evento = await gestaoEventoService.validarTokenGestao(token);
    return this.criarConfirmacaoPorEventoId(evento.id, input);
  }

  async atualizarPorTokenGestao(
    token: string,
    confirmacaoId: string,
    input: AtualizarConfirmacaoRsvpInput
  ): Promise<FestaEventoConfirmacao> {
    const evento = await gestaoEventoService.validarTokenGestao(token);
    return this.atualizarConfirmacaoPorEventoId(evento.id, confirmacaoId, input);
  }

  async excluirPorTokenGestao(token: string, confirmacaoId: string): Promise<void> {
    const evento = await gestaoEventoService.validarTokenGestao(token);
    await this.excluirConfirmacaoPorEventoId(evento.id, confirmacaoId);
  }
}

export const conviteService = new ConviteService();
