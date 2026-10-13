/** True for well-formed https URLs only (rejects javascript:, data:, http:). */
export function isHttpsUrl(text: string): boolean {
  try {
    return new URL(text).protocol === "https:";
  } catch {
    return false;
  }
}

/** True when `url` lives under the given ImageKit endpoint (same origin and path prefix). */
export function isUrlOnEndpoint(url: string, endpoint: string): boolean {
  try {
    const target = new URL(url);
    const base = new URL(endpoint);
    const basePath = base.pathname.replace(/\/+$/, "");
    return (
      target.origin === base.origin &&
      (target.pathname === basePath || target.pathname.startsWith(`${basePath}/`))
    );
  } catch {
    return false;
  }
}