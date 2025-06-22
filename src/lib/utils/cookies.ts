//

interface CookieOptions {
  path?: string;
  expires?: Date;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

/**
 * Set a cookie with the given name and value
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
) {
  const {
    path = "/",
    expires,
    maxAge,
    domain,
    secure = process.env.NODE_ENV === "production",
    sameSite = "Lax",
    httpOnly = false,
  } = options;

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (path) cookie += `; path=${path}`;
  if (expires) cookie += `; expires=${expires.toUTCString()}`;
  if (maxAge) cookie += `; max-age=${maxAge}`;
  if (domain) cookie += `; domain=${domain}`;
  if (secure) cookie += "; secure";
  if (sameSite) cookie += `; samesite=${sameSite}`;
  if (httpOnly) cookie += "; httponly";

  document.cookie = cookie;
}

/**
 * Get a cookie by name
 */
export function getCookie(name: string): string | null {
  if (typeof window === "undefined") return null;

  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string, options: CookieOptions = {}) {
  setCookie(name, "", {
    ...options,
    expires: new Date(0),
  });
}

/**
 * Authentication specific cookie operations
 */
export const authCookies = {
  setToken(token: string) {
    // get exp from token
    const { exp } = JSON.parse(atob(token.split(".")[1]));
    setCookie("token", token, {
      // TODO: enable in production
      secure: false,
      sameSite: "Lax",
      maxAge: exp - Math.floor(Date.now() / 1000),
    });
  },

  getToken() {
    return getCookie("token");
  },

  clearToken() {
    deleteCookie("token", {
      secure: true,
      sameSite: "Strict",
    });
  },
};
