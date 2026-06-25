/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite self-host no Cefor via Docker com imagem mínima
  output: "standalone",
};

// PWA: habilitar quando o app estiver sendo construído.
// import withPWA from "next-pwa";
// export default withPWA({ dest: "public", disable: process.env.NODE_ENV === "development" })(nextConfig);

export default nextConfig;
