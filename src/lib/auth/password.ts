/**
 * Password hashing usando Node.js crypto nativo (scrypt).
 * Zero dependências externas — compatível com Cloudflare Workers via Web Crypto API.
 */
import { scryptSync, timingSafeEqual } from 'crypto'

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 33554432 }
const KEY_LEN = 64

export function hashPassword(password: string, salt: string): string {
  const buf = scryptSync(password, salt, KEY_LEN, SCRYPT_PARAMS)
  return `${buf.toString('hex')}.${salt}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [hash, salt] = stored.split('.')
  if (!hash || !salt) return false

  try {
    const storedBuf = Buffer.from(hash, 'hex')
    const inputBuf = scryptSync(password, salt, KEY_LEN, SCRYPT_PARAMS)
    return timingSafeEqual(storedBuf, inputBuf)
  } catch {
    return false
  }
}
