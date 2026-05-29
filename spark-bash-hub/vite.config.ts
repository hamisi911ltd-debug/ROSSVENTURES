// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    server: {
      host: "0.0.0.0",
      middlewareMode: false,
    },
    plugins: [
      {
        name: "dev-admin-login-middleware",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            try {
              const rawUrl = req.url ?? "";
              const pathname = rawUrl.startsWith("http") ? new URL(rawUrl).pathname : rawUrl.split("?")[0];
              if (pathname === "/admin-login" && req.method === "POST") {
                let body = "";
                req.on("data", (chunk) => (body += chunk));
                req.on("end", () => {
                  res.setHeader("content-type", "application/json; charset=utf-8");
                  try {
                    const parsed = JSON.parse(body || "{}");
                    const password = typeof parsed?.password === "string" ? parsed.password : "";
                    const adminPassword = process.env.VITE_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
                    if (!adminPassword) {
                      res.statusCode = 500;
                      res.end(JSON.stringify({ ok: false, message: "Admin password is not configured." }));
                      return;
                    }
                    if (password === adminPassword) {
                      res.statusCode = 200;
                      res.end(JSON.stringify({ ok: true }));
                      return;
                    }
                    res.statusCode = 401;
                    res.end(JSON.stringify({ ok: false, message: "Invalid password." }));
                  } catch (err) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ ok: false, message: "Invalid request." }));
                  }
                });
                return;
              }
            } catch (e) {
              // fallthrough to next
            }
            next();
          });
        },
      },
    ],
  },
});
