// Reads Worker secrets/vars. In a deployed Worker these live in the
// `cloudflare:workers` virtual module; locally (vite dev) they come from process.env / .dev.vars.
let _cfEnv: any = null;

async function getCFEnv(): Promise<any> {
  if (_cfEnv) return _cfEnv;
  try {
    // @ts-ignore - cloudflare:workers is a Cloudflare runtime virtual module
    const { env } = await import("cloudflare:workers");
    _cfEnv = env ?? {};
  } catch {
    _cfEnv = {};
  }
  return _cfEnv;
}

export async function getEnvVar(name: string): Promise<string | undefined> {
  const env = await getCFEnv();
  const fromCF = env?.[name];
  if (typeof fromCF === "string" && fromCF) return fromCF;
  if (typeof process !== "undefined" && process.env?.[name]) return process.env[name];
  return undefined;
}

/** A Worker binding (KV namespace, D1, R2…) by name. */
export async function getEnvBinding(name: string): Promise<any> {
  const env = await getCFEnv();
  return env?.[name] ?? null;
}
