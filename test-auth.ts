// Script de prueba para las Server Actions de autenticación
// Este archivo es para desarrollo y pruebas locales

import { registerUser, loginUser } from './lib/actions/auth'

async function testAuthActions() {
  console.log('🧪 Iniciando pruebas de autenticación...\n')

  try {
    // Test 1: Registro de usuario
    console.log('1. Probando registro de usuario...')
    const registerResult = await registerUser({
      email: 'test@example.com',
      password: 'password123'
    })
    
    if (registerResult.success) {
      console.log('✅ Registro exitoso:', registerResult.data?.user)
    } else {
      console.log('❌ Error en registro:', registerResult.error)
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Test 2: Login con credenciales correctas
    console.log('2. Probando login con credenciales correctas...')
    const loginResult = await loginUser({
      email: 'test@example.com',
      password: 'password123'
    })
    
    if (loginResult.success && loginResult.data) {
      console.log('✅ Login exitoso:', {
        user: loginResult.data.user,
        hasToken: !!loginResult.data.token
      })
    } else {
      console.log('❌ Error en login:', loginResult.error)
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Test 3: Login con credenciales incorrectas
    console.log('3. Probando login con credenciales incorrectas...')
    const wrongLoginResult = await loginUser({
      email: 'test@example.com',
      password: 'wrongpassword'
    })
    
    if (!wrongLoginResult.success) {
      console.log('✅ Error esperado:', wrongLoginResult.error)
    } else {
      console.log('❌ Login debería haber fallado')
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Test 4: Registro con email duplicado
    console.log('4. Probando registro con email duplicado...')
    const duplicateRegisterResult = await registerUser({
      email: 'test@example.com',
      password: 'password456'
    })
    
    if (!duplicateRegisterResult.success) {
      console.log('✅ Error esperado:', duplicateRegisterResult.error)
    } else {
      console.log('❌ Registro debería haber fallado')
    }

    console.log('\n✅ Todas las pruebas completadas')

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error)
  }
}

// Ejecutar pruebas si este archivo se ejecuta directamente
if (require.main === module) {
  testAuthActions()
}

export { testAuthActions }