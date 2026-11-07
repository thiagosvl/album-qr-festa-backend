import { z } from "zod";

export const solicitarRecuperacaoSchema = z.object({
  identificador: z
    .string()
    .trim()
    .min(3, "Informe seu e-mail ou CPF/CNPJ para recuperar a senha."),
});

export const validarCodigoRecuperacaoSchema = z.object({
  identificador: z.string().trim().min(3, "Identificador inválido."),
  codigo: z
    .string()
    .trim()
    .length(6, "O código deve conter exatamente 6 dígitos."),
});

export const resetarSenhaRecuperacaoSchema = z.object({
  recovery_id: z.string().uuid("ID de recuperação inválido."),
  nova_senha: z
    .string()
    .min(6, "A nova senha deve ter no mínimo 6 caracteres."),
});

export type SolicitarRecuperacaoInput = z.infer<
  typeof solicitarRecuperacaoSchema
>;
export type ValidarCodigoRecuperacaoInput = z.infer<
  typeof validarCodigoRecuperacaoSchema
>;
export type ResetarSenhaRecuperacaoInput = z.infer<
  typeof resetarSenhaRecuperacaoSchema
>;
