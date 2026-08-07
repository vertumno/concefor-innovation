// Contato de uma conexão: como mostrar, como abrir e como levar embora.
// Networking é troca de contato (decisão do benchmark EDEN — sem chat), então o
// que importa aqui é o dado sair do app para a agenda da pessoa sem atrito.

export type Contato = {
  nome: string;
  email?: string;
  telefone?: string;
  instagram?: string;
  categoria?: string;
};

// E.164 simplificado: o perfil já guarda DDI + número. Devolve null quando o
// valor não cabe no padrão internacional; a UI ainda permite copiá-lo.
export function telefoneE164(telefone: string): string | null {
  const d = telefone.replace(/\D/g, "");
  return d.length >= 7 && d.length <= 15 ? `+${d}` : null;
}

// "5527999998888" → "+55 (27) 99999-8888". Para outros países, preserva o
// formato universal sem inventar agrupamentos nacionais.
export function telefoneFormatado(telefone: string): string {
  const d = telefone.replace(/\D/g, "");
  if (d.startsWith("55")) {
    const local = d.slice(2);
    if (local.length === 10 || local.length === 11) {
      const ddd = local.slice(0, 2);
      const resto = local.slice(2);
      const meio = resto.length === 9 ? resto.slice(0, 5) : resto.slice(0, 4);
      return `+55 (${ddd}) ${meio}-${resto.slice(meio.length)}`;
    }
  }
  return telefoneE164(d) ?? telefone;
}

export function instagramLink(handle: string): string {
  return `https://instagram.com/${handle.replace(/^@/, "")}`;
}

// Copiar exige contexto seguro para a API moderna (temos HTTPS no domínio
// oficial); pelo IP em HTTP da rede local ela não existe, daí o execCommand.
export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {
    /* sem permissão: tenta o caminho antigo */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, texto.length); // iOS ignora select() sozinho
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// Todos os dados numa tacada só — para colar em qualquer lugar.
export function contatoEmTexto(c: Contato): string {
  return [
    c.nome,
    c.categoria,
    c.email,
    c.telefone ? `Telefone: ${telefoneFormatado(c.telefone)}` : null,
    c.instagram ? `Instagram: @${c.instagram}` : null,
    "Conexão feita no VIII Concefor",
  ]
    .filter(Boolean)
    .join("\n");
}

function escapaVCard(v: string): string {
  return v.replace(/([\\,;])/g, "\\$1").replace(/\n/g, "\\n");
}

export function vcard(c: Contato): string {
  const partes = c.nome.trim().split(/\s+/);
  const sobrenome = partes.length > 1 ? partes[partes.length - 1] : "";
  const primeiro = partes[0] ?? "";
  const tel = c.telefone ? telefoneE164(c.telefone) : null;
  const linhas = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapaVCard(sobrenome)};${escapaVCard(primeiro)};;;`,
    `FN:${escapaVCard(c.nome)}`,
    c.email ? `EMAIL;TYPE=INTERNET:${escapaVCard(c.email)}` : null,
    c.telefone ? `TEL;TYPE=CELL:${tel ?? c.telefone}` : null,
    c.instagram ? `URL:${instagramLink(c.instagram)}` : null,
    `NOTE:${escapaVCard(`Conexão do VIII Concefor${c.categoria ? ` · ${c.categoria}` : ""}`)}`,
    "END:VCARD",
  ];
  return linhas.filter(Boolean).join("\r\n");
}

// Salvar na agenda: no iPhone o caminho que funciona é a folha de
// compartilhamento (o download de arquivo abre uma aba e morre ali); no resto,
// download normal do .vcf.
export async function salvarContato(c: Contato): Promise<boolean> {
  const arquivo = `${c.nome.replace(/[^\p{L}\p{N} ]/gu, "").trim() || "contato"}.vcf`;
  const blob = new Blob([vcard(c)], { type: "text/vcard;charset=utf-8" });
  try {
    const file = new File([blob], arquivo, { type: "text/vcard" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: c.nome });
      return true;
    }
  } catch {
    /* cancelou ou não deu: cai no download */
  }
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = arquivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  } catch {
    return false;
  }
}
