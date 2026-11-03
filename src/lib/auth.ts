import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "fallback-insecure-secret-key-minimum-32-chars-long";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = process.env.ADMIN_SESSION_COOKIE || "zella_admin_session_token";

export interface AdminSessionPayload {
  adminId: string;
  email: string;
  name: string;
  role: string;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createAdminToken(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      adminId: payload.adminId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function getSessionAdmin(): Promise<AdminSessionPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyAdminToken(token);
  } catch {
    return null;
  }
}

export async function getAdminFromRequest(req: NextRequest | Request): Promise<AdminSessionPayload | null> {
  // Check cookie or Authorization Bearer header
  let token: string | undefined;

  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (!token && "cookies" in req && typeof (req as any).cookies?.get === "function") {
    token = (req as any).cookies.get(COOKIE_NAME)?.value;
  }

  if (!token) {
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }
  }

  if (!token) return null;
  return await verifyAdminToken(token);
}

export async function logAdminAudit(
  adminEmail: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, any>
) {
  try {
    await prisma.auditLog.create({
      data: {
        adminEmail,
        action,
        entityType,
        entityId: entityId || null,
        detailsJson: details ? JSON.stringify(details) : null,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

export { COOKIE_NAME };
