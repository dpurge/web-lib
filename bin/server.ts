import { serveDir } from "@std/http/file-server"

Deno.serve({ port: 8000 }, (req) => {
  const pathname = new URL(req.url).pathname

  if (pathname.startsWith("/js/")) {
    return serveDir(req, {
      fsRoot: "dist",
      urlRoot: "js",
    })
  }
  else if (pathname.startsWith("/css/")) {
    return serveDir(req, {
      fsRoot: "dist",
      urlRoot: "css",
    })
  }
  else {
    return serveDir(req, {
      fsRoot: "src/web",
    })
  }
});