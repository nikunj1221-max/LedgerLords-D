import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createSessionCredentials,
  hashPassword,
  hashSessionToken,
  verifyPassword,
} from './auth';

test('password hashes verify the original password without storing it in plaintext', async () => {
  const password = 'correct horse battery staple';
  const passwordHash = await hashPassword(password);

  assert.notEqual(passwordHash, password);
  assert.match(passwordHash, /^scrypt\$[A-Za-z0-9_-]+\$[A-Za-z0-9_-]+$/);
  assert.equal(await verifyPassword(password, passwordHash), true);
  assert.equal(await verifyPassword('incorrect password', passwordHash), false);
});

test('session credentials use an opaque token and store only its digest', () => {
  const credentials = createSessionCredentials();

  assert.match(credentials.token, /^[A-Za-z0-9_-]{40,}$/);
  assert.notEqual(credentials.tokenHash, credentials.token);
  assert.equal(credentials.tokenHash, hashSessionToken(credentials.token));
  assert.ok(credentials.expiresAt.getTime() > Date.now());
});
