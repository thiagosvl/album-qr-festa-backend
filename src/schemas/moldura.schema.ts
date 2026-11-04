import { z } from "zod";

export const criarMolduraEventoSchema = z.object({
  nome: z.string().min(1).max(80),
  arquivo_path: z.string().min(3).max(300),
  ordem: z.number().int().min(0).default(0),
  ativa: z.boolean().default(true),
});

export const atualizarMolduraEventoSchema = z.object({
  nome: z.string().min(1).max(80).optional(),
  arquivo_path: z.string().min(3).max(300).optional(),
  ordem: z.number().int().min(0).optional(),
  ativa: z.boolean().optional(),
});

export const reordenarMoldurasSchema = z.object({
  ordens: z.array(
    z.object({
      id: z.string().uuid(),
      ordem: z.number().int().min(0),
    })
  ),
});

export type CriarMolduraEventoInput = z.infer<typeof criarMolduraEventoSchema>;
export type AtualizarMolduraEventoInput = z.infer<typeof atualizarMolduraEventoSchema>;
export type ReordenarMoldurasInput = z.infer<typeof reordenarMoldurasSchema>;
