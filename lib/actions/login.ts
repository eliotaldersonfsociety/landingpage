'use server'

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/* =========================
   Validación
========================= */
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

/* =========================
    Server Action
========================= */
export async function loginAction(state: { success: boolean; error?: string }, formData: FormData): Promise<{ success: boolean; error?: string }> {
  // 🔹 Obtener datos
  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()
  const redirectParam = formData.get('redirect')?.toString()

  // 🔹 Validar entrada
  const validatedData = loginSchema.parse({ email, password })

  // 🔹 Buscar usuario
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, validatedData.email))
    .limit(1)

  if (userResult.length === 0) {
    return { success: false, error: 'Credenciales inválidas' }
  }

  const user = userResult[0]

  // 🔹 Determinar redirect basado en rol
  const redirectTo = user.role === 'admin' ? '/admin' : (redirectParam || '/dashboard')

  // 🔹 Verificar contraseña
  const isValidPassword = await bcrypt.compare(
    validatedData.password,
    user.password
  )

  if (!isValidPassword) {
    return { success: false, error: 'Credenciales inválidas' }
  }

  // 🔹 Generar JWT
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'tu_secreto_jwt_aqui',
    { expiresIn: '7d' }
  )

  // 🔹 Guardar cookie
  const cookieStore = await cookies()
  cookieStore.set('authToken', token, {
    httpOnly: process.env.NODE_ENV === 'production',
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  // Redirect
  redirect(redirectTo)
}

export async function getCurrentUser(): Promise<{ id: number; email: string; role: string; name?: string; address?: string; city?: string; department?: string; whatsappNumber?: string } | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value
    if (!token) return null
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    // Fetch full user data from database
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1)

    if (userResult.length === 0) return null

    const user = userResult[0]
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name || undefined,
      address: user.address || undefined,
      city: user.city || undefined,
      department: user.department || undefined,
      whatsappNumber: user.whatsappNumber || undefined,
    }
  } catch {
    return null
  }
}
