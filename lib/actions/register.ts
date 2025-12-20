'use server'

import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(1, 'El nombre es requerido'),
  address: z.string().min(1, 'La dirección es requerida'),
  city: z.string().min(1, 'La ciudad es requerida'),
  department: z.string().min(1, 'El departamento es requerido'),
  whatsappNumber: z.string().min(1, 'El número de WhatsApp es requerido'),
})

interface AuthResponse {
  success: boolean
  error?: string
  data?: {
    user?: {
      id: number
      email: string
      name?: string
      address?: string
      city?: string
      department?: string
      whatsappNumber?: string
      role: string
    }
  }
}

// Función de registro
export async function registerAction(state: AuthResponse, formData: FormData): Promise<AuthResponse> {
  try {
    // Extraer datos del FormData
    const email = formData.get('email')?.toString()
    const password = formData.get('password')?.toString()
    const name = formData.get('name')?.toString()
    const address = formData.get('address')?.toString()
    const city = formData.get('city')?.toString()
    const department = formData.get('department')?.toString()
    const whatsappNumber = formData.get('whatsappNumber')?.toString()

    // Validar entrada
    const validatedData = registerSchema.parse({ email, password, name, address, city, department, whatsappNumber })

    // Verificar si el usuario ya existe
    const existingUser = await db.select().from(users).where(eq(users.email, validatedData.email)).limit(1)
    if (existingUser.length > 0) {
      return {
        success: false,
        error: 'El email ya está registrado'
      }
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Crear usuario
    const result = await db.insert(users).values({
      email: validatedData.email,
      password: hashedPassword,
      name: validatedData.name,
      address: validatedData.address,
      city: validatedData.city,
      department: validatedData.department,
      whatsappNumber: validatedData.whatsappNumber,
    }).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      address: users.address,
      city: users.city,
      department: users.department,
      whatsappNumber: users.whatsappNumber,
    })

    const newUser = result[0]

    return {
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name || undefined,
          address: newUser.address || undefined,
          city: newUser.city || undefined,
          department: newUser.department || undefined,
          whatsappNumber: newUser.whatsappNumber || undefined,
          role: 'user',
        }
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Datos de entrada inválidos'
      }
    }

    console.error('Error en registerAction:', error)
    return {
      success: false,
      error: 'Error interno del servidor'
    }
  }
}