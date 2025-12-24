'use server'

import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function validateResetToken(token: string) {
  if (!token) return { valid: false }

  try {
    const userResult = await db.select({
      id: users.id,
      email: users.email,
      resetTokenExpires: users.resetTokenExpires,
    }).from(users).where(eq(users.resetToken, token)).limit(1)

    if (!userResult || userResult.length === 0) {
      return { valid: false }
    }

    const u = userResult[0]
    if (!u.resetTokenExpires || u.resetTokenExpires < Math.floor(Date.now() / 1000)) {
      return { valid: false, expired: true }
    }

    return { valid: true, email: u.email }
  } catch (err) {
    console.error('Token validation error:', err)
    return { valid: false }
  }
}

export async function resetPassword(formData: FormData) {
  const token = formData.get('token') as string
  const newPassword = formData.get('password') as string

  if (!token || !newPassword) return { error: 'Token and new password are required' }
  if (newPassword.length < 6) return { error: 'Password must be at least 6 characters' }

  try {
    const userResult = await db.select({
      id: users.id,
      resetTokenExpires: users.resetTokenExpires,
    }).from(users).where(eq(users.resetToken, token)).limit(1)

    if (!userResult || userResult.length === 0) {
      return { error: 'Invalid or expired reset token' }
    }

    const u = userResult[0]
    if (!u.resetTokenExpires || u.resetTokenExpires < Math.floor(Date.now() / 1000)) {
      return { error: 'Reset token has expired' }
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    await db.update(users)
      .set({
        password: newPasswordHash,
        resetToken: null,
        resetTokenExpires: null,
      })
      .where(eq(users.id, u.id))

    return { success: true, message: 'Password has been reset successfully' }
  } catch (err) {
    console.error('Password reset error:', err)
    return { error: 'Failed to reset password' }
  }
}
