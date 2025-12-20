'use server'

import { cookies } from 'next/headers'

// Función de logout
export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies()
    // Borrar todas las cookies
    const allCookies = cookieStore.getAll()
    allCookies.forEach(cookie => {
      cookieStore.delete(cookie.name)
    })
    return { success: true }
  } catch (error) {
    console.error('Error en logoutAction:', error)
    return { success: false }
  }
}