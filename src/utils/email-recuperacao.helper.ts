import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { messages } from "../constants/messages.js";
import { AppError } from "../errors/AppError.js";
import {
  COR_MARCA_EMAIL,
  NOME_MARCA,
  URL_LOGO_EMAIL,
} from "../constants/marca.js";

function montarHtmlRecuperacaoSenha(params: {
  nome: string;
  codigo: string;
}): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Recuperação de Senha — ${NOME_MARCA}</title>
</head>
<body style="margin:0;padding:0;background-color:#faf7f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1b1525;">
  <div style="max-width:560px;margin:28px auto;background:#ffffff;border:1px solid #ece6f4;border-radius:20px;overflow:hidden;">
    <div style="background-color:${COR_MARCA_EMAIL};padding:28px 32px;text-align:center;">
      <img src="${URL_LOGO_EMAIL}" alt="${NOME_MARCA}" width="220" height="71" style="display:block;margin:0 auto;border:0;outline:none;width:220px;max-width:100%;height:auto;color:#ffffff;font-size:20px;font-weight:800;" />
      <p style="margin:12px 0 0;color:rgba(255,255,255,0.88);font-size:13px;">Recuperação de Acesso</p>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:#1b1525;">Olá, ${params.nome}!</p>
      <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#5f5870;">
        Recebemos uma solicitação para redefinir a senha da sua conta. Digite o código de 6 dígitos abaixo na tela de recuperação:
      </p>
      <div style="background:#f8f4fc;border:2px dashed #d6c5f5;border-radius:16px;padding:22px;text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#7b3fe4;">Código de Verificação</p>
        <p style="margin:0;font-family:'Courier New',monospace;font-size:32px;font-weight:800;letter-spacing:10px;color:#1b1525;">${params.codigo}</p>
        <p style="margin:8px 0 0;font-size:12px;color:#8e879e;">Válido por 15 minutos</p>
      </div>
      <p style="margin:0;font-size:12px;line-height:1.5;color:#8e879e;">
        Se você não solicitou esta alteração, ignore este e-mail com segurança. Sua senha atual permanecerá ativa.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function dispararEmailRecuperacaoSenha(params: {
  emailDestino: string;
  nome: string;
  codigo: string;
}): Promise<{ enviadoPorEmail: boolean }> {
  const apiKey = env.RESEND_API_KEY.trim();

  if (!apiKey) {
    logger.info(
      {
        emailDestino: params.emailDestino,
        codigoRecuperacao: params.codigo,
      },
      "[Recuperação de Senha] RESEND_API_KEY não configurada. Código OTP gerado em modo local."
    );
    return { enviadoPorEmail: false };
  }

  const destinatarioFinal =
    env.NODE_ENV !== "production" && env.RESEND_OVERRIDE_EMAIL.trim()
      ? env.RESEND_OVERRIDE_EMAIL.trim()
      : params.emailDestino;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to: [destinatarioFinal],
      subject: `${params.codigo} é seu código de recuperação ${NOME_MARCA}`,
      html: montarHtmlRecuperacaoSenha({
        nome: params.nome,
        codigo: params.codigo,
      }),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(
      { status: response.status, errorText },
      "Falha ao enviar e-mail de recuperação via Resend"
    );
    throw new AppError(messages.auth.falhaEnvioEmailRecuperacao, 502);
  }

  return { enviadoPorEmail: true };
}
