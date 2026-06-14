import "server-only";
import { cookies } from "next/headers";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookie,
  refreshCookie,
} from "./cookie-config";

export { ACCESS_COOKIE, REFRESH_COOKIE };

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const store = await cookies();
  store.set(accessCookie(accessToken));
  store.set(refreshCookie(refreshToken));
}

export async function setAccessCookie(accessToken: string) {
  const store = await cookies();
  store.set(accessCookie(accessToken));
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function readAuthCookies() {
  const store = await cookies();
  return {
    accessToken: store.get(ACCESS_COOKIE)?.value ?? null,
    refreshToken: store.get(REFRESH_COOKIE)?.value ?? null,
  };
}
