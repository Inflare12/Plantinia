import { NextRequest } from 'next/server';
import { verifyJWT, JWTPayload } from './jwt';
import { db } from '../db/adapter';
import { User } from '../db/schema';

export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  if (password.length > 128) {
    throw new Error('Password must not exceed 128 characters');
  }

  const enc = new TextEncoder();
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = Array.from(saltBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  const passKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 310000,
      hash: 'SHA-256',
    },
    passKey,
    256
  );

  const hash = Array.from(new Uint8Array(derivedKey))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `pbkdf2_sha256$310000$${salt}$${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    if (!password || typeof password !== 'string' || password.length > 128) {
      return false;
    }
    if (!stored || typeof stored !== 'string') {
      return false;
    }

    const parts = stored.split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2_sha256') return false;
    const iterations = Number(parts[1]);
    const saltHex = parts[2];
    const expectedHex = parts[3];
    if (!Number.isInteger(iterations) || iterations < 100000) return false;

    const salt = new Uint8Array(saltHex.match(/.{2}/g)?.map((h) => parseInt(h, 16)) || []);
    if (salt.length < 16 || expectedHex.length !== 64) return false;

    const enc = new TextEncoder();
    const passKey = await crypto.subtle.importKey(
      'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
    );
    const derived = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      passKey,
      256
    );
    const actual = new Uint8Array(derived);
    const expected = new Uint8Array(expectedHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
    if (actual.length !== expected.length) return false;

    let diff = 0;
    for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
    return diff === 0;
  } catch {
    return false;
  }
}

// Pre-computed dummy hash to run constant-time PBKDF2 calculation when an account is not found,
// preventing timing attacks / email enumeration on login.
const DUMMY_TIMING_HASH =
  'pbkdf2_sha256$310000$00000000000000000000000000000000$0000000000000000000000000000000000000000000000000000000000000000';

export async function dummyVerifyPassword(): Promise<void> {
  await verifyPassword('timing-defense-string-non-empty', DUMMY_TIMING_HASH);
}

export async function getSessionUser(req: NextRequest): Promise<User | null> {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  if (!token) {
    const cookie = req.cookies.get('plantinia_token');
    if (cookie) token = cookie.value;
  }

  const apiKey = req.headers.get('x-api-key');
  if (apiKey && apiKey.length >= 16) {
    const matched = await db.users.findByApiKey(apiKey);
    if (matched) return matched;
  }

  if (!token) return null;

  const payload: JWTPayload | null = await verifyJWT(token);
  if (!payload || !payload.userId) return null;

  return await db.users.findById(payload.userId);
}
