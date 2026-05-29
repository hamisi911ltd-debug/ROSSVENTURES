import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function createJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    if (url.pathname === "/admin-login") {
      if (request.method !== "POST") {
        return createJsonResponse({ ok: false, message: "Invalid request method." }, 405);
      }
      try {
        const body = await request.json();
        const password = typeof body?.password === "string" ? body.password : "";
        const adminPasswordFromEnv = typeof env === "object" && env !== null ? (env as Record<string, unknown>).ADMIN_PASSWORD : undefined;
        const adminPasswordFromProcess =
          typeof process !== "undefined" && process?.env && typeof (process.env as Record<string, unknown>).ADMIN_PASSWORD === "string"
            ? (process.env as Record<string, unknown>).ADMIN_PASSWORD
            : undefined;
        const adminPasswordFromMeta =
          typeof import.meta !== "undefined" && typeof (import.meta as any).env?.VITE_ADMIN_PASSWORD === "string"
            ? (import.meta as any).env.VITE_ADMIN_PASSWORD
            : undefined;
        const adminPassword =
          typeof adminPasswordFromEnv === "string" && adminPasswordFromEnv.length > 0
            ? adminPasswordFromEnv
            : typeof adminPasswordFromProcess === "string" && adminPasswordFromProcess.length > 0
            ? adminPasswordFromProcess
            : typeof adminPasswordFromMeta === "string" && adminPasswordFromMeta.length > 0
            ? adminPasswordFromMeta
            : undefined;

        if (!adminPassword) {
          return createJsonResponse({ ok: false, message: "Admin password is not configured." }, 500);
        }

        if (password === adminPassword) {
          return createJsonResponse({ ok: true });
        }

        return createJsonResponse({ ok: false, message: "Invalid password." }, 401);
      } catch (error) {
        return createJsonResponse({ ok: false, message: "Invalid request." }, 400);
      }
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
