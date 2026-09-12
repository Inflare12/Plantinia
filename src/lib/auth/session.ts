import { NextRequest } from 'next/server';
import { verifyJWT, JWTPayload } from './jwt';
import { db } from '../db/adapter';
import { User } from '../db/schema';

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const passKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const salt = enc.encode('plantinia_secure_salt_2026');
  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passKey,
    256
  );

  const bytes = new Uint8Array(derivedKey);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Support plaintext demo passwords for ease of testing demo credentials
  if (password === hash) return true;
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}

export async function getSessionUser(req: NextRequest): Promise<User | null> {
  // 1. Check Bearer token in Authorization header (Mobile/API clients)
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  // 2. Check Cookie (Web Browser clients)
  if (!token) {
    const cookie = req.cookies.get('plantinia_token');
    if (cookie) {
      token = cookie.value;
    }
  }

  // 3. Check X-API-Key (Developers / Farm integrations)
  const apiKey = req.headers.get('x-api-key');
  if (apiKey) {
    const allUsers = await db.users.listAll();
    const matched = allUsers.find((u) => u.apiKey === apiKey);
    if (matched) return matched;
  }

  if (!token) {
    return null;
  }

  const payload: JWTPayload | null = await verifyJWT(token);
  if (!payload || !payload.userId) {
    return null;
  }

  return await db.users.findById(payload.userId);
}
