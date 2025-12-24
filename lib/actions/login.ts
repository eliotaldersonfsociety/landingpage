'use server'

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// ─── Validación con Zod ───────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

// ─── Server Action: Login ─────────────────────────────
export async function loginAction(
  _prevState: { success: boolean; error?: string },
  formData: FormData
) {
  try {
    // 🔹 Leer datos del formulario
    const email = formData.get('email')?.toString()?.trim()
    const password = formData.get('password')?.toString()
    const redirectParam = formData.get('redirect')?.toString()

    if (!email || !password) {
      return { success: false, error: 'Email y contraseña son requeridos' }
    }

    console.log('Login attempt started')
    console.log('Form data:', { email, redirectParam })

    // 🔹 Validar con Zod
    const validatedData = loginSchema.parse({ email, password })
    console.log('Validation passed')

    // 🔹 Buscar usuario en la base de datos
    console.log('Querying database...')
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1)

    console.log('Database result:', userResult.length)

    if (userResult.length === 0) {
      console.log('User not found')
      return { success: false, error: 'Credenciales inválidas' }
    }

    const user = userResult[0]
    console.log('User found:', user.id, user.email)

    // 🔹 Determinar ruta de redirección
    const redirectTo = user.role === 'admin' ? '/admin' : (redirectParam || '/dashboard')
    console.log('Redirect to:', redirectTo)

    // 🔹 Verificar contraseña
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password)
    if (!isValidPassword) {
      console.log('Invalid password')
      return { success: false, error: 'Credenciales inválidas' }
    }
    console.log('Password valid')

    // 🔹 Generar JWT
    const secret = process.env.JWT_SECRET
    if (!secret) {
      console.error('JWT_SECRET no está definido en las variables de entorno')
      return { success: false, error: 'Error interno del servidor' }
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: '7d' }
    )
    console.log('JWT generated')

    // 🔹 Guardar en cookie (HTTP-only, seguro)
    const cookieStore = await cookies()
    cookieStore.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    })
    console.log('Cookie set, redirecting to:', redirectTo)

    // ✅ Redirigir (Next.js lanza NEXT_REDIRECT → es normal)
    redirect(redirectTo)

  } catch (error: any) {
    // ❗ Ignorar NEXT_REDIRECT (es parte del flujo normal de Next.js)
    if (error?.digest?.includes?.('NEXT_REDIRECT')) {
      // No es un error → permitir que Next.js lo maneje
      throw error
    }

    // ❌ Errores reales (validación, DB, etc.)
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Datos inválidos' }
    }

    console.error('Login error real:', error)
    return { success: false, error: 'Error interno del servidor' }
  }
}

// ─── Helper: Obtener usuario actual ───────────────────
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) return null

    const secret = process.env.JWT_SECRET
    if (!secret) return null

    const decoded = jwt.verify(token, secret) as any

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
  } catch (error) {
    console.error('getCurrentUser error:', error)
    return null
  }
}