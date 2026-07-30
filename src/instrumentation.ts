// Sync automático do Even3 embutido no serviço (30/07): o servidor puxa
// programação + inscritos sozinho a cada SYNC_INTERVAL_MIN minutos (default
// 10; 0 desliga). Hook padrão do Next: register() roda quando o servidor sobe.
//
// A checagem de NEXT_RUNTIME precisa ser um `if` englobando o import (padrão
// da doc do Next): o compilador troca a env por constante e ELIMINA o ramo no
// compile edge — sem isso o webpack tenta resolver better-sqlite3 (nativo,
// usa fs) fora do Node e o dev quebra com "Can't resolve 'fs'".

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node");
  }
}
