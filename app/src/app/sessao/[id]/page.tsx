"use client";

import { use } from "react";
import { SessionView } from "@/components/SessionView";

// A tela em si vive em components/SessionView — compartilhada com o "Ao Vivo".
export default function SessaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <SessionView id={id} />;
}
