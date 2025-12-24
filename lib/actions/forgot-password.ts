'use server'

import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'
import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Mock functions - replace with actual implementations
async function getIp() { return '127.0.0.1' }
class RateLimiter {
  constructor(name: string, limit: number, window: number) {}
  async limit(ip: string) { return { success: true } }
}

export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get('email') as string || '').trim().toLowerCase()
  if (!email) return { error: 'Email is required' }

  // Rate limiting - Máximo 3 intentos cada 10 min
  const ip = await getIp()
  const rl = await new RateLimiter('pwdreset', 3, 600).limit(ip)

  if (!rl.success) {
    return { error: 'Too many password reset requests. Please try again later.' }
  }

  try {
    // Check if user exists (only needed to decide update)
    const found = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
    if (!found || found.length === 0) {
      // For security, return success message even if not found
      return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' }
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpires = Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes

    await db.update(users)
      .set({
        resetToken,
        resetTokenExpires,
      })
      .where(eq(users.email, email))

    // Try to send email; if send fails, don't reveal to user — just log.
    if (resend) {
      const resetLink = `${BASE_URL}/reset-password?token=${resetToken}`
      try {
        await resend.emails.send({
          from: 'TiendaTexas Support <noreply@tiendatexas.com>',
          to: [email],
          subject: 'Reset your password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ea580c;">Reset your password</h2>
              <p>You requested a password reset for your TiendaTexas account.</p>
              <p>Click the link below to reset your password:</p>
              <a href="${resetLink}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Reset Password</a>
              <p>This link will expire in 15 minutes.</p>
            </div>
          `,
        })
      } catch (sendErr) {
        console.error('Failed to send reset email (Resend):', sendErr)
        // Continue — don't expose email failures to caller
      }
    } else {
      console.warn('Resend not configured; skipping email send.')
    }

    return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' , resetToken } // token returned for dev/testing
  } catch (err) {
    console.error('Password reset request error:', err)
    return { error: 'Failed to process password reset request' }
  }
}