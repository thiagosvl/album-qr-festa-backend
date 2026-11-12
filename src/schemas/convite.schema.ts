import { z } from "zod";
import { messages } from "../constants/messages.js";

export const salvarConfirmacaoRsvpSchema = z
  .object({
    adultos: z.number().int().min(1).max(30),
    criancas: z.number().int().min(0).max(30).default(0),
    nomes_adultos: z.array(z.string().max(120)).min(1).max(30),
    nomes_criancas: z.array(z.string().max(120)).max(30).default([]),
    telefone: z.string().max(30).nullable().optional(),
    observacoes: z.string().max(400).nullable().optional(),
  })
  .refine(
    (data) => Boolean(data.nomes_adultos[0] && data.nomes_adultos[0].trim().length >= 2),
    {
      message: messages.convite.primeiroAdultoObrigatorio,
      path: ["nomes_adultos"],
    }
  );

export const atualizarConfirmacaoRsvpSchema = salvarConfirmacaoRsvpSchema;

export type SalvarConfirmacaoRsvpInput = z.infer<typeof salvarConfirmacaoRsvpSchema>;
export type AtualizarConfirmacaoRsvpInput = z.infer<
  typeof atualizarConfirmacaoRsvpSchema
>;
