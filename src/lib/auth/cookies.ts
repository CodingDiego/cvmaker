import "server-only";
import { cookies } from "next/headers";

export const ACCESS_COOKIE = "cv_at";
export const REFRESH_COOKIE = "cv_rt";

const ACCESS_MAX_AGE = 15 * 60; // 15 minutes
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

function baseOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, { ...baseOptions(), maxAge: ACCESS_MAX_AGE });
  store.set(REFRESH_COOKIE, refreshToken, { ...baseOptions(), maxAge: REFRESH_MAX_AGE });
}

export async function setAccessCookie(accessToken: string) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, { ...baseOptions(), maxAge: ACCESS_MAX_AGE });
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
