// Sessão autenticada do participante. O token bruto existe somente no cookie
// HttpOnly; no SQLite guardamos SHA-256. clientId continua útil para cor/avatar
// e métricas do aparelho, mas não concede autorização a nenhuma rota.

import { createHash, randomBytes } from "node:crypto";
import { deleteAuthSession, getAuthSession, insertAuthSession, type AuthSession } from "./db";

export const SESSION_COOKIE = "concefor_session";
const SESSION_DAYS = 30;
const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function cookieValue(req: Request): string | null {
  const cookie = req.headers.get("cookie") ?? "";
  for (const part of cookie.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function createParticipantSession(args: {
  attendeeId: number;
  clientId: string;
  nome: string;
}): { token: string; expiresAt: string } {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();
  insertAuthSession({ tokenHash: hashToken(token), expiresAt, ...args });
  return { token, expiresAt };
}

export function participantSession(req: Request): AuthSession | null {
  const token = cookieValue(req);
  return token ? getAuthSession(hashToken(token)) : null;
}

export function revokeParticipantSession(req: Request): AuthSession | null {
  const token = cookieValue(req);
  return token ? deleteAuthSession(hashToken(token)) : null;
}

export function sessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}${secure}`;
}

export function clearSessionCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

// Identidade visual pública para o telão. É estável, mas não permite recuperar
// o clientId aleatório original nem autorizar chamadas.
export function publicActorId(clientId: string | null): string | null {
  if (!clientId) return null;
  return createHash("sha256").update(`concefor-avatar:${clientId}`).digest("hex").slice(0, 20);
}
