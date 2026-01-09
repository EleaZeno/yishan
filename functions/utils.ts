
export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: any;
  error?: string;
}

export interface Env {
  DB: any;
  JWT_SECRET: string;
}

// Define PagesFunction since it's being imported from here by the API handlers
export type PagesFunction<
  Env = any,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>
> = (context: {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Record<Params, string>;
  data: Data;
}) => Response | Promise<Response>;

// 自动初始化数据库表结构
export async function ensureTables(db: any) {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            password_hash TEXT,
            salt TEXT,
            created_at INTEGER
        );
        CREATE TABLE IF NOT EXISTS words (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            term TEXT,
            definition TEXT,
            phonetic TEXT,
            example_sentence TEXT,
            example_translation TEXT,
            tags TEXT,
            strength REAL DEFAULT 0,
            interval INTEGER DEFAULT 0,
            due_date INTEGER,
            repetitions INTEGER DEFAULT 0,
            created_at INTEGER,
            is_deleted INTEGER DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_words_user_due ON words(user_id, due_date, is_deleted);
        CREATE INDEX IF NOT EXISTS idx_words_user_term ON words(user_id, term);
    `);
}

export async function signToken(payload: any, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = arrayBufferToBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = arrayBufferToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const data = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, data);
  return `${encodedHeader}.${encodedPayload}.${arrayBufferToBase64Url(signature)}`;
}

export async function verifyToken(token: string, secret: string): Promise<any> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const data = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
  const signature = base64UrlToArrayBuffer(encodedSignature);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const isValid = await crypto.subtle.verify('HMAC', key, signature, data);
  if (!isValid) throw new Error('Invalid signature');
  return JSON.parse(new TextDecoder().decode(base64UrlToArrayBuffer(encodedPayload)));
}

export async function hashPassword(password: string, saltHex?: string) {
  const enc = new TextEncoder();
  const salt = saltHex ? hexToBuf(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]);
  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const exportedKey = await crypto.subtle.exportKey("raw", key);
  return { hash: bufToHex(exportedKey), salt: bufToHex(salt) };
}

function arrayBufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function base64UrlToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
function bufToHex(buffer: ArrayBuffer): string { return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join(''); }
function hexToBuf(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    return bytes;
}
export function jsonResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
