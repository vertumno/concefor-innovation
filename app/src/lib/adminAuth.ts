// Proteção simples do admin (R3): um token único em ADMIN_TOKEN (.env.local),
// sem gestão de usuários (spec §5). Aceito por header (x-admin-token) ou query
// (?token=) — a página /admin guarda no localStorage e manda por header.
// SERVER-ONLY (lê process.env) — não importar em código de cliente.

export function isAdmin(req: Request): boolean {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false; // sem token configurado, admin fica fechado
  const url = new URL(req.url);
  const sent = req.headers.get("x-admin-token") ?? url.searchParams.get("token");
  return sent === token;
}

export function unauthorized(): Response {
  return Response.json({ error: "não autorizado" }, { status: 401 });
}
