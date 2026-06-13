import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * Short-lived access token (JWT, HS256). Edge-safe (jose) so it can be verified
 * inside the Next.js proxy/middleware without touching the database.
 */

const ACCESS_TTL = "15m";

export interface AccessClaims extends JWTPayload {
  sub: string; // userId
  sid: string; // session id
  email: string;
  name?: string | null;
}

function secret(): Uint8Array {
  const value = process.env.AUTH_JWT_SECRET;
  if (!value) throw new Error("Missing AUTH_JWT_SECRET");
  return new TextEncoder().encode(value);
}

export async function signAccessToken(claims: {
  userId: string;
  sessionId: string;
  email: string;
  name?: string | null;
}): Promise<string> {
  return new SignJWT({ email: claims.email, name: claims.name, sid: claims.sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.userId)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(secret());
}

export async function verifyAccessToken(token: string): Promise<AccessClaims | null> {
  try {
    const { payload } = await jwtVerify<AccessClaims>(token, secret(), {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}
