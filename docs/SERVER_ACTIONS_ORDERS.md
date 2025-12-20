# Server Actions para Pedidos

Este documento describe las Server Actions implementadas para reemplazar las rutas API de pedidos.

## 📁 Estructura de Archivos

```
lib/actions/
├── auth.ts                 # Server Actions de autenticación
└── orders.ts               # Server Actions de pedidos

app/api/
├── auth/
│   ├── register/route.ts   # Ruta API que usa Server Action
│   └── login/route.ts      # Ruta API que usa Server Action
├── orders/
│   └── route.ts            # Ruta API de pedidos (reemplazable)
└── order-items/
    └── route.ts            # Ruta API de items (reemplazable)
```

## 🚀 Server Actions de Pedidos Implementadas

### `createOrderAction(formData: FormData)`
Server Action que maneja la creación de pedidos usando FormData.

**Características:**
- ✅ Validación de entrada con Zod
- ✅ Obtención automática del userId del token JWT
- ✅ Creación de pedido en base de datos
- ✅ Manejo de errores y validación de permisos
- ✅ Conversión de campos nullable a undefined

**Parámetros requeridos en FormData:**
- `total` (string/number): Total del pedido
- `status` (string): Estado del pedido
- `paymentProof` (string, opcional): Comprobante de pago
- `additionalInfo` (string, opcional): Información adicional

### `createOrderItemsAction(formData: FormData)`
Server Action que maneja la creación de items de pedidos usando FormData.

**Características:**
- ✅ Validación de entrada con Zod
- ✅ Verificación de propiedad del pedido
- ✅ Creación de múltiples items en lote
- ✅ Validación de permisos de usuario

**Parámetros requeridos en FormData:**
- `orderId` (string/number): ID del pedido
- `items` (string JSON): Array de items con formato `{ "items": [{ "name": "string", "price": number }] }`

## 🔧 Funciones de Compatibilidad

Para mantener compatibilidad con el contexto existente, también se incluyen:

### `createOrder(data: OrderData)`
Función que acepta un objeto OrderData en lugar de FormData.

```typescript
interface OrderData {
  total: number
  status: string
  paymentProof?: string
  additionalInfo?: string
}
```

### `createOrderItems(data: OrderItemData)`
Función que acepta un objeto con orderId y items.

```typescript
interface OrderItemData {
  orderId: number
  items: Array<{
    name: string
    price: number
  }>
}
```

## 🔐 Autenticación y Seguridad

### Obtención de UserId
Las Server Actions obtienen automáticamente el userId del token JWT almacenado en cookies:

```typescript
async function getUserIdFromToken(): Promise<number> {
  const cookieStore = await cookies()
  const token = cookieStore.get('authToken')?.value
  
  if (!token) {
    throw new Error('Token de autenticación no encontrado')
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
    userId: number
    email: string
  }
  return decoded.userId
}
```

### Validación de Permisos
Las funciones verifican que el pedido pertenece al usuario antes de crear items:

```typescript
const orderCheck = await db.select().from(orders).where(
  eq(orders.id, validatedData.orderId)
).limit(1)

if (orderCheck[0].userId !== userId) {
  return {
    success: false,
    error: 'No tienes permisos para agregar items a este pedido'
  }
}
```

## 📝 Ejemplos de Uso

### Formulario con Server Actions

```tsx
import { createOrderAction, createOrderItemsAction } from '@/lib/actions/orders'

export async function handleCreateOrder(formData: FormData) {
  const result = await createOrderAction(formData)
  
  if (result.success) {
    console.log('Pedido creado:', result.data?.order)
  } else {
    console.error('Error:', result.error)
  }
}

export async function handleCreateOrderItems(formData: FormData) {
  const result = await createOrderItemsAction(formData)
  
  if (result.success) {
    console.log('Items creados:', result.data?.items)
  } else {
    console.error('Error:', result.error)
  }
}
```

### Uso con Datos JSON

```typescript
import { createOrder, createOrderItems } from '@/lib/actions/orders'

// Crear pedido
const orderResult = await createOrder({
  total: 150.00,
  status: 'pending',
  paymentProof: 'payment_proof_123',
  additionalInfo: 'Entrega en la tarde'
})

// Crear items
const itemsResult = await createOrderItems({
  orderId: orderResult.data?.order?.id || 0,
  items: [
    { name: 'Producto 1', price: 50.00 },
    { name: 'Producto 2', price: 100.00 }
  ]
})
```

## 🧪 Pruebas

Para probar las Server Actions de pedidos, usar los endpoints API existentes o crear formularios:

```bash
# Los endpoints API siguen funcionando
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"total":150,"status":"pending","additionalInfo":"Test"}'

curl -X POST http://localhost:3000/api/order-items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"orderId":1,"items":[{"name":"Test","price":50}]}'
```

## 🔄 Migración de Rutas API

### Antes (Rutas API):
```typescript
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ total, status, additionalInfo })
})
```

### Después (Server Actions):
```typescript
// Opción 1: FormData
const formData = new FormData()
formData.append('total', total.toString())
formData.append('status', status)
formData.append('additionalInfo', additionalInfo || '')
const result = await createOrderAction(formData)

// Opción 2: JSON (compatibilidad)
const result = await createOrder({ total, status, additionalInfo })
```

## ✅ Validaciones Implementadas

### Crear Pedido:
- ✅ Total debe ser mayor a 0
- ✅ Estado es requerido
- ✅ Token de autenticación válido
- ✅ Usuario autenticado

### Crear Items:
- ✅ OrderId válido
- ✅ Al menos un item
- ✅ Cada item tiene nombre y precio válido
- ✅ Pedido existe
- ✅ Usuario tiene permisos en el pedido

## 🎯 Características Avanzadas

### Manejo de Errores
- Validación de entrada con mensajes específicos
- Errores de autenticación manejados por separado
- Logs de errores para debugging
- Respuestas consistentes

### Compatibilidad
- Funciones FormData para nuevos formularios
- Funciones JSON para mantener compatibilidad
- Tipos TypeScript completos
- Interfaces bien definidas

### Seguridad
- Validación de tokens JWT
- Verificación de permisos por pedido
- Sanitización de datos de entrada
- Manejo seguro de errores