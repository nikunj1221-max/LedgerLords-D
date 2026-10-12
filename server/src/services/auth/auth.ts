import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prisma';

const scryptAsync = promisify(scrypt);
const SESSION_COOKIE = 'nexusflow_session';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const PASSWORD_KEY_LENGTH = 64;

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  onboardingComplete: boolean;
  createdAt: Date;
}

function toPublicUser(user: PublicUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    onboardingComplete: user.onboardingComplete,
    createdAt: user.createdAt,
  };
}

function getCookie(req: Request, name: string): string | undefined {
  const cookies = req.headers.cookie?.split(';') ?? [];
  for (const cookie of cookies) {
    const separator = cookie.indexOf('=');
    if (separator < 0 || cookie.slice(0, separator).trim() !== name) continue;
    return cookie.slice(separator + 1).trim();
  }
  return undefined;
}

export function getSessionToken(req: Request): string | undefined {
  const token = getCookie(req, SESSION_COOKIE);
  return token && /^[A-Za-z0-9_-]{40,}$/.test(token) ? token : undefined;
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function cookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isCrossOrigin = process.env.CROSS_ORIGIN_AUTH === 'true';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isCrossOrigin ? 'none' : 'lax') as 'none' | 'lax',
    path: '/api',
  };
}

export function setSessionCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(SESSION_COOKIE, token, {
    ...cookieOptions(),
    expires: expiresAt,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, cookieOptions());
}

export function createSessionCredentials() {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  return { token, tokenHash: hashSessionToken(token), expiresAt };
}

export async function createUserSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const { token, tokenHash, expiresAt } = createSessionCredentials();
  await prisma.userSession.create({
    data: { tokenHash, userId, expiresAt },
  });
  return { token, expiresAt };
}

export async function getSessionUser(token: string): Promise<PublicUser | null> {
  const tokenHash = hashSessionToken(token);
  const session = await prisma.userSession.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await prisma.userSession.delete({ where: { tokenHash } });
    return null;
  }
  return toPublicUser(session.user);
}

export async function deleteUserSession(token: string): Promise<void> {
  await prisma.userSession.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('base64url');
  const derivedKey = await scryptAsync(password, salt, PASSWORD_KEY_LENGTH) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString('base64url')}`;
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const [algorithm, salt, storedKey] = passwordHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !storedKey) return false;

  const expectedKey = Buffer.from(storedKey, 'base64url');
  if (expectedKey.length !== PASSWORD_KEY_LENGTH) return false;
  const actualKey = await scryptAsync(password, salt, PASSWORD_KEY_LENGTH) as Buffer;
  return timingSafeEqual(expectedKey, actualKey);
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = getSessionToken(req);
  if (!token) {
    clearSessionCookie(res);
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  try {
    const user = await getSessionUser(token);
    if (!user) {
      clearSessionCookie(res);
      res.status(401).json({ error: 'Session expired. Please sign in again.' });
      return;
    }
    res.locals.authUser = user;
    next();
  } catch (error) {
    console.error('Failed to validate authentication session:', error);
    res.status(503).json({ error: 'Authentication service temporarily unavailable.' });
  }
}
