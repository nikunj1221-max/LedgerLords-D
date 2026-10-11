import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import rateLimit from 'express-rate-limit';
import { prisma } from '../services/database/prisma';
import {
  clearSessionCookie,
  createSessionCredentials,
  createUserSession,
  deleteUserSession,
  getSessionToken,
  hashPassword,
  PublicUser,
  requireAuth,
  setSessionCookie,
  verifyPassword,
} from '../services/auth/auth';

const router = Router();
const authAttemptLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function publicUser(user: PublicUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    onboardingComplete: user.onboardingComplete,
    createdAt: user.createdAt,
  };
}

router.post('/signup', authAttemptLimit, async (req: Request, res: Response) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = isValidEmail(req.body?.email) ? req.body.email.trim().toLowerCase() : '';
  const password = req.body?.password;

  if (!name || name.length > 80) {
    res.status(400).json({ error: 'Name is required and must be at most 80 characters.' });
    return;
  }
  if (!email) {
    res.status(400).json({ error: 'Enter a valid email address.' });
    return;
  }
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
    res.status(400).json({ error: 'Password must be between 12 and 128 characters.' });
    return;
  }

  try {
    const passwordHash = await hashPassword(password);
    const { token, tokenHash, expiresAt } = createSessionCredentials();
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        sessions: {
          create: {
            tokenHash,
            expiresAt,
          },
        },
      },
    });
    setSessionCookie(res, token, expiresAt);
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }
    console.error('Failed to create user account:', error);
    res.status(503).json({ error: 'Could not create your account right now. Please try again.' });
  }
});

router.post('/login', authAttemptLimit, async (req: Request, res: Response) => {
  const email = isValidEmail(req.body?.email) ? req.body.email.trim().toLowerCase() : '';
  const password = req.body?.password;
  if (!email || typeof password !== 'string' || password.length > 128) {
    res.status(400).json({ error: 'Enter a valid email and password.' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) await hashPassword(password);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ error: 'Email or password is incorrect.' });
      return;
    }
    const session = await createUserSession(user.id);
    setSessionCookie(res, session.token, session.expiresAt);
    res.json({ user: publicUser(user) });
  } catch (error) {
    console.error('Failed to authenticate user:', error);
    res.status(503).json({ error: 'Could not sign in right now. Please try again.' });
  }
});

router.get('/session', requireAuth, (req: Request, res: Response) => {
  res.json({ user: publicUser(res.locals.authUser as PublicUser) });
});

router.post('/logout', async (req: Request, res: Response) => {
  try {
    const token = getSessionToken(req);
    if (token) await deleteUserSession(token);
    clearSessionCookie(res);
    res.status(204).end();
  } catch (error) {
    console.error('Failed to end user session:', error);
    res.status(503).json({ error: 'Could not sign out right now. Please try again.' });
  }
});

export default router;
