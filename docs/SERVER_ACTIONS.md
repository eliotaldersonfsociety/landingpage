# Server Actions para Autenticación

Este documento describe las Server Actions implementadas para reemplazar las rutas API de autenticación.

## 📁 Estructura de Archivos

```
lib/actions/
└── auth.ts                 # Server Actions de autenticación

app/api/auth/
├── register/route.ts       # Ruta API que usa Server Action
└── login/route.ts          # Ruta API que usa Server Action

components/auth/
├── auth-modal.tsx          # Modal actualizado
├── auth-form.tsx           # Nuevo formulario con Server Actions
├── login-form.tsx          # Formulario original (mantiene compatibilidad)
└── register-form.tsx       # Formulario original (mantiene compatibilidad)
```

## 🚀 Server Actions Implementadas

### `registerAction(formData: FormData)`
Server Action que maneja el registro de usuarios usando FormData.

**Características:**
- ✅ Validación de entrada con Zod
- ✅ Verificación de email duplicado
- ✅ Hash de contraseña con bcrypt
- ✅ Creación de usuario en base de datos
- ✅ Manejo de errores

### `loginAction(formData: FormData)`
Server Action que maneja el login de usuarios usando FormData.

**Características:**
- ✅ Validación de entrada con Zod
- ✅ Verificación de credenciales
- ✅ Generación de JWT token
- ✅ Retorno de datos del usuario

### Funciones de Compatibilidad

Para mantener compatibilidad con el contexto existente, también se incluyen:

- `registerUser(data: { email: string; password: string })`
- `loginUser(data: { email: string; password: string })`

## 🔧 Uso en Componentes

### Formulario con Server Actions (Nuevo)

```tsx
import { AuthForm } from '@/components/auth/auth-form'

export function MyAuthComponent() {
  return (
    <AuthForm 
      mode="login" 
      onSuccess={() => console.log('Auth success')}
      onSwitchMode={() => setMode('register')}
    />
  )
}
```

### Uso Directo de Server Actions

```tsx
import { registerAction, loginAction } from '@/lib/actions/auth'

export async function handleRegister(formData: FormData) {
  const result = await registerAction(formData)
  
  if (result.success) {
    console.log('Usuario registrado:', result.data?.user)
  } else {
    console.error('Error:', result.error)
  }
}
```

### API Endpoints (Compatibilidad)

Los endpoints API existentes siguen funcionando y ahora usan Server Actions internamente:

```typescript
// POST /api/auth/register
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})

// POST /api/auth/login  
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

## 🧪 Pruebas

Para probar las Server Actions:

```bash
# Ejecutar pruebas de autenticación
npx tsx test-auth.ts
```

O usar los endpoints API para probar:
```bash
# Registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔐 Seguridad

- **Hash de contraseñas**: Bcrypt con 12 rounds
- **Validación**: Zod para validación de entrada
- **JWT Tokens**: Firmados con secret del entorno
- **Manejo de errores**: Sin exposición de datos sensibles

## 🔄 Migración

### De Rutas API a Server Actions

**Antes:**
```typescript
// En componentes cliente
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})
```

**Después (opción 1 - Server Actions):**
```typescript
// FormData con Server Actions
const formData = new FormData()
formData.append('email', email)
formData.append('password', password)
const result = await loginAction(formData)
```

**Después (opción 2 - Mantener API):**
```typescript
// Los endpoints API siguen funcionando igual
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})
```

## 📝 Notas Importantes

1. **Compatibilidad**: Las rutas API existentes siguen funcionando
2. **Server Actions**: Solo se pueden usar en componentes de servidor o formularios
3. **Client Components**: Deben usar las rutas API o crear formularios
4. **Migración gradual**: Se puede migrar componente por componente

## 🎯 Próximos Pasos

- [ ] Expandir esquema de usuario para incluir más campos
- [ ] Implementar validación adicional en Server Actions
- [ ] Añadir middleware de autenticación
- [ ] Implementar refresh tokens
- [ ] Añadir rate limiting