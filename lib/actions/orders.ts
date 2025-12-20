'use server'

import { cookies } from 'next/headers'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { z } from 'zod'
import { db } from '@/lib/db'
import { orders, orderItems, users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import ImageKit from 'imagekit'

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
})

// Interfaces para tipos
interface OrderData {
  total: number
  status: string
  paymentProof?: string
  paymentMethod?: string
  paypalOrderId?: string
  additionalInfo?: string
}

interface OrderItemData {
  orderId: number
  name: string
  price: number
}

// Esquemas de validación
const createOrderSchema = z.object({
  total: z.number().positive('El total debe ser mayor a 0'),
  status: z.string().min(1, 'El estado es requerido'),
  paymentProof: z.string().optional(),
  paymentMethod: z.string().optional(),
  paypalOrderId: z.string().optional(),
  additionalInfo: z.string().optional(),
})

const createOrderItemsSchema = z.object({
  orderId: z.number().positive('ID de pedido inválido'),
  items: z.array(z.object({
    name: z.string().min(1, 'El nombre del item es requerido'),
    price: z.number().positive('El precio debe ser mayor a 0'),
  })).min(1, 'Debe haber al menos un item')
})

// Tipos para las respuestas
interface OrderResponse {
  success: boolean
  error?: string
  data?: {
    order?: {
      id: number
      userId: number
      total: number
      status: string
      paymentProof?: string
      paymentMethod?: string
      paypalOrderId?: string
      additionalInfo?: string
    }
    items?: Array<{
      id: number
      orderId: number
      name: string
      price: number
    }>
    orders?: Array<{
      id: number
      userId?: number
      total: number
      status: string
      paymentProof?: string | null
      paymentMethod?: string | null
      paypalOrderId?: string | null
      additionalInfo?: string | null
      items: Array<{
        id: number
        name: string
        price: number
      }>
      user?: {
        id: number
        name?: string | null
        email: string
        address?: string | null
        city?: string | null
        department?: string | null
        whatsappNumber?: string | null
      }
    }>
  }
}

// Función auxiliar para obtener userId del token JWT
async function getUserIdFromToken(): Promise<number> {
  const cookieStore = await cookies()
  const token = cookieStore.get('authToken')?.value

  console.log('Token from cookie:', token ? 'present' : 'not found')

  if (!token) {
    throw new Error('Token de autenticación no encontrado')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
      userId: number
      email: string
      role: string
    }
    console.log('Decoded userId:', decoded.userId)
    return decoded.userId
  } catch (error) {
    console.error('Error verifying token:', error)
    throw new Error('Token de autenticación inválido')
  }
}

// Server Action para crear un pedido
export async function createOrderAction(formData: FormData): Promise<OrderResponse> {
  try {
    // Extraer datos del FormData
    const total = parseFloat(formData.get('total')?.toString() || '0')
    const status = formData.get('status')?.toString() || ''
    const file = formData.get('file') as File
    const paymentMethod = formData.get('paymentMethod')?.toString() || undefined
    const paypalOrderId = formData.get('paypalOrderId')?.toString() || undefined
    const additionalInfo = formData.get('additionalInfo')?.toString() || undefined

    // Subir archivo a ImageKit
    let paymentProof: string | undefined
    if (file) {
      if (file.size > 1024 * 1024) {
        return { success: false, error: 'File size must be less than 1MB' }
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        return { success: false, error: 'Invalid file type. Only JPG, PNG, PDF allowed' }
      }
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const result = await imagekit.upload({
        file: buffer,
        fileName: file.name,
        folder: '/payment-proofs',
      })
      paymentProof = result.url
    }

    // Validar entrada
    const validatedData = createOrderSchema.parse({
      total,
      status,
      paymentProof,
      paymentMethod,
      paypalOrderId,
      additionalInfo,
    })

    // Obtener userId del token
    const userId = await getUserIdFromToken()

    console.log('Creating order for user:', userId, 'with paymentProof:', paymentProof)

    // Crear el pedido
    const result = await db.insert(orders).values({
      userId,
      total: validatedData.total,
      status: validatedData.status,
      paymentProof: validatedData.paymentProof,
      paymentMethod: validatedData.paymentMethod,
      paypalOrderId: validatedData.paypalOrderId,
      additionalInfo: validatedData.additionalInfo,
    }).returning({
      id: orders.id,
      userId: orders.userId,
      total: orders.total,
      status: orders.status,
      paymentProof: orders.paymentProof,
      paymentMethod: orders.paymentMethod,
      paypalOrderId: orders.paypalOrderId,
      additionalInfo: orders.additionalInfo,
    })

    const newOrder = result[0]
    console.log('Order created:', newOrder.id)

    return {
      success: true,
      data: {
        order: {
          id: newOrder.id,
          userId: newOrder.userId,
          total: newOrder.total,
          status: newOrder.status,
          paymentProof: newOrder.paymentProof || undefined,
          paymentMethod: newOrder.paymentMethod || undefined,
          paypalOrderId: newOrder.paypalOrderId || undefined,
          additionalInfo: newOrder.additionalInfo || undefined,
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

    if (error instanceof Error && error.message.includes('Token')) {
      return {
        success: false,
        error: error.message
      }
    }

    console.error('Error en createOrderAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    }
  }
}

// Server Action para crear items de un pedido
export async function createOrderItemsAction(formData: FormData): Promise<OrderResponse> {
  try {
    // Extraer datos del FormData
    const orderId = parseInt(formData.get('orderId')?.toString() || '0')
    const itemsJson = formData.get('items')?.toString() || '[]'

    // Parsear items del JSON
    let items: Array<{ name: string; price: number }>
    try {
      items = JSON.parse(itemsJson)
    } catch {
      return {
        success: false,
        error: 'Formato de items inválido'
      }
    }

    // Validar entrada
    const validatedData = createOrderItemsSchema.parse({
      orderId,
      items,
    })

    // Verificar que el pedido existe y pertenece al usuario
    const userId = await getUserIdFromToken()
    const orderCheck = await db.select().from(orders).where(
      eq(orders.id, validatedData.orderId)
    ).limit(1)

    if (orderCheck.length === 0) {
      return {
        success: false,
        error: 'Pedido no encontrado'
      }
    }

    if (orderCheck[0].userId !== userId) {
      return {
        success: false,
        error: 'No tienes permisos para agregar items a este pedido'
      }
    }

    // Preparar items para insertar
    const itemsToInsert = validatedData.items.map(item => ({
      orderId: validatedData.orderId,
      name: item.name,
      price: item.price,
    }))

    // Insertar los items
    const result = await db.insert(orderItems).values(itemsToInsert).returning({
      id: orderItems.id,
      orderId: orderItems.orderId,
      name: orderItems.name,
      price: orderItems.price,
    })

    return {
      success: true,
      data: {
        items: result
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Datos de entrada inválidos'
      }
    }
    
    if (error instanceof Error && error.message.includes('Token')) {
      return {
        success: false,
        error: error.message
      }
    }
    
    console.error('Error en createOrderItemsAction:', error)
    return {
      success: false,
      error: 'Error interno del servidor'
    }
  }
}

// Funciones de compatibilidad que aceptan JSON (para mantener compatibilidad)
export async function createOrder(data: OrderData): Promise<OrderResponse> {
  try {
    // Validar entrada
    const validatedData = createOrderSchema.parse(data)

    // Obtener userId del token
    const userId = await getUserIdFromToken()

    console.log('Creating order for user:', userId, 'with paymentProof length:', validatedData.paymentProof?.length)

    // Crear el pedido
    const result = await db.insert(orders).values({
      userId,
      total: validatedData.total,
      status: validatedData.status,
      paymentProof: validatedData.paymentProof,
      paymentMethod: validatedData.paymentMethod,
      paypalOrderId: validatedData.paypalOrderId,
      additionalInfo: validatedData.additionalInfo,
    }).returning({
      id: orders.id,
      userId: orders.userId,
      total: orders.total,
      status: orders.status,
      paymentProof: orders.paymentProof,
      paymentMethod: orders.paymentMethod,
      paypalOrderId: orders.paypalOrderId,
      additionalInfo: orders.additionalInfo,
    })

    const newOrder = result[0]
    console.log('Order created:', newOrder.id)

    return {
      success: true,
      data: {
        order: {
          id: newOrder.id,
          userId: newOrder.userId,
          total: newOrder.total,
          status: newOrder.status,
          paymentProof: newOrder.paymentProof || undefined,
          paymentMethod: newOrder.paymentMethod || undefined,
          paypalOrderId: newOrder.paypalOrderId || undefined,
          additionalInfo: newOrder.additionalInfo || undefined,
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
    
    if (error instanceof Error && error.message.includes('Token')) {
      return {
        success: false,
        error: error.message
      }
    }
    
    console.error('Error en createOrder:', error)
    return {
      success: false,
      error: 'Error interno del servidor'
    }
  }
}

// Función auxiliar para validar que un pedido pertenece al usuario
async function validateOrderOwnership(orderId: number, userId: number): Promise<boolean> {
  const orderCheck = await db.select().from(orders).where(
    eq(orders.id, orderId)
  ).limit(1)

  if (orderCheck.length === 0) {
    return false
  }

  return orderCheck[0].userId === userId
}

export async function createOrderItems(data: OrderItemData & { items: Array<{ name: string; price: number }> }): Promise<OrderResponse> {
  try {
    // Validar entrada
    const validatedData = createOrderItemsSchema.parse({
      orderId: data.orderId,
      items: data.items,
    })

    // Verificar que el pedido existe y pertenece al usuario
    const userId = await getUserIdFromToken()
    const orderCheck = await db.select().from(orders).where(
      eq(orders.id, validatedData.orderId)
    ).limit(1)

    if (orderCheck.length === 0) {
      return {
        success: false,
        error: 'Pedido no encontrado'
      }
    }

    if (orderCheck[0].userId !== userId) {
      return {
        success: false,
        error: 'No tienes permisos para agregar items a este pedido'
      }
    }

    // Preparar items para insertar
    const itemsToInsert = validatedData.items.map(item => ({
      orderId: validatedData.orderId,
      name: item.name,
      price: item.price,
    }))

    // Insertar los items
    const result = await db.insert(orderItems).values(itemsToInsert).returning({
      id: orderItems.id,
      orderId: orderItems.orderId,
      name: orderItems.name,
      price: orderItems.price,
    })

    return {
      success: true,
      data: {
        items: result
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Datos de entrada inválidos'
      }
    }
    
    if (error instanceof Error && error.message.includes('Token')) {
      return {
        success: false,
        error: error.message
      }
    }
    
    console.error('Error en createOrderItems:', error)
    return {
      success: false,
      error: 'Error interno del servidor'
    }
  }
}

// Server Action para obtener pedidos del usuario
export async function getUserOrdersAction(): Promise<OrderResponse> {
  try {
    const userId = await getUserIdFromToken()
    console.log('Fetching orders for userId:', userId)

    const userOrders = await db.select({
      id: orders.id,
      total: orders.total,
      status: orders.status,
      paymentProof: orders.paymentProof,
      paymentMethod: orders.paymentMethod,
      paypalOrderId: orders.paypalOrderId,
      additionalInfo: orders.additionalInfo,
    }).from(orders).where(eq(orders.userId, userId))
    console.log('Found orders:', userOrders.length)

    // Para cada pedido, obtener los items
    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db.select({
          id: orderItems.id,
          name: orderItems.name,
          price: orderItems.price,
        }).from(orderItems).where(eq(orderItems.orderId, order.id))

        return {
          ...order,
          items,
        }
      })
    )

    return {
      success: true,
      data: {
        orders: ordersWithItems,
      }
    }
  } catch (error) {
    console.error('Error en getUserOrdersAction:', error)
    return {
      success: false,
      error: 'Error interno del servidor'
    }
  }
}

// Server Action para actualizar el estado de un pedido (admin)
export async function updateOrderStatusAction(orderId: number, newStatus: string): Promise<OrderResponse> {
  try {
    // Verificar que el usuario es admin
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value
    if (!token) {
      return { success: false, error: 'No autorizado' }
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { role: string }
    if (decoded.role !== 'admin') {
      return { success: false, error: 'Solo administradores pueden actualizar estados' }
    }

    // Actualizar el estado
    await db.update(orders).set({ status: newStatus }).where(eq(orders.id, orderId))

    return { success: true }
  } catch (error) {
    console.error('Error en updateOrderStatusAction:', error)
    return {
      success: false,
      error: 'Error interno del servidor'
    }
  }
}

// Server Action para obtener todos los pedidos (admin)
export async function getAllOrdersAction(): Promise<OrderResponse> {
  try {
    const allOrders = await db.select({
      id: orders.id,
      userId: orders.userId,
      total: orders.total,
      status: orders.status,
      paymentProof: orders.paymentProof,
      paymentMethod: orders.paymentMethod,
      paypalOrderId: orders.paypalOrderId,
      additionalInfo: orders.additionalInfo,
    }).from(orders).orderBy(orders.id)

    // Para cada pedido, obtener los items y datos del usuario
    const ordersWithDetails = await Promise.all(
      allOrders.map(async (order) => {
        const items = await db.select({
          id: orderItems.id,
          name: orderItems.name,
          price: orderItems.price,
        }).from(orderItems).where(eq(orderItems.orderId, order.id))

        const user = await db.select({
          id: users.id,
          name: users.name,
          email: users.email,
          address: users.address,
          city: users.city,
          department: users.department,
          whatsappNumber: users.whatsappNumber,
        }).from(users).where(eq(users.id, order.userId)).limit(1)

        return {
          ...order,
          items,
          user: user[0],
        }
      })
    )

    return {
      success: true,
      data: {
        orders: ordersWithDetails,
      }
    }
  } catch (error) {
    console.error('Error en getAllOrdersAction:', error)
    return {
      success: false,
      error: 'Error interno del servidor'
    }
  }
}