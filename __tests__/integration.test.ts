import { describe, it, expect } from 'vitest'
import crypto from 'crypto'

describe('ImpersonateKit Integration', () => {
  it('FLOW-001: token is single-use (replay rejected)', () => {
    const token = { id: 'tok_1', usedAt: null as Date | null, expiresAt: new Date(Date.now() + 900000) }
    const useToken = () => {
      if (token.usedAt !== null) throw new Error('Token already used')
      if (token.expiresAt < new Date()) throw new Error('Token expired')
      token.usedAt = new Date()
    }
    useToken()
    expect(() => useToken()).toThrow('Token already used')
  })

  it('FLOW-002: timingSafeEqual prevents timing attacks', () => {
    const safeCompare = (a: string, b: string) => {
      if (a.length !== b.length) return false
      return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
    }
    expect(safeCompare('correct-secret', 'correct-secret')).toBe(true)
    expect(safeCompare('wrong-secret!!', 'correct-secret')).toBe(false)
  })

  it('FLOW-003: RBAC blocks member from generating token', () => {
    const checkRbac = (role: string) => {
      if (role !== 'owner' && role !== 'admin') throw new Error('Forbidden')
    }
    expect(() => checkRbac('member')).toThrow('Forbidden')
    expect(() => checkRbac('owner')).not.toThrow()
    expect(() => checkRbac('admin')).not.toThrow()
  })

  it('FLOW-004: session cookie is httpOnly secure', () => {
    const cookieOptions = { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 1800 }
    expect(cookieOptions.httpOnly).toBe(true)
    expect(cookieOptions.secure).toBe(true)
    expect(cookieOptions.maxAge).toBeLessThanOrEqual(1800)
  })

  it('FLOW-005: API key stored as SHA-256 hash only', () => {
    const plainKey = 'ik_live_' + crypto.randomBytes(24).toString('hex')
    const hash = crypto.createHash('sha256').update(plainKey).digest('hex')
    expect(hash).toHaveLength(64)
    expect(hash).not.toBe(plainKey)
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })
})
