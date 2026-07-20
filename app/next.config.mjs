/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite self-host no Cefor via Docker com imagem mínima
  output: "standalone",
  // better-sqlite3 é binário nativo: não empacotar no bundle do servidor,
  // manter como require de node_modules (necessário no standalone).
  serverExternalPackages: ["better-sqlite3"],
  // Rotas renomeadas no R1 (barra inferior): links antigos continuam valendo.
  async redirects() {
    return [
      { source: "/timeline", destination: "/agenda", permanent: true },
      { source: "/informacoes", destination: "/mais", permanent: true },
    ];
  },
};

// PWA: habilitar quando o app estiver sendo construído.
// import withPWA from "next-pwa";
// export default withPWA({ dest: "public", disable: process.env.NODE_ENV === "development" })(nextConfig);

export default nextConfig;
