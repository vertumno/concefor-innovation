import Link from "next/link";

// Placeholder do modo telão (feature 4.2). A animação "batimento cardíaco" das
// reações em tempo real (canal Realtime do Supabase) entra na semana 3.
// Ver spec/app-v1.md §4.2.
export default function TelaoPage() {
  return (
    <>
      <h1 className="page-title">Telão</h1>
      <p className="page-sub">Tela grande projetada — reações ao vivo do público.</p>
      <div className="notice">
        <strong>Em construção (semana 3).</strong> Aqui vai rodar o “batimento cardíaco”: uma
        linha que pulsa a cada reação, agregando o canal Realtime da sessão em andamento. Roda em
        navegador num PC ligado ao projetor (palco / TVs laterais).
        <br />
        <br />
        <Link href="/">Voltar ao início</Link>
      </div>
    </>
  );
}
