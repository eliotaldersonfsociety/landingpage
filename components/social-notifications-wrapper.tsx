"use client"

import dynamic from 'next/dynamic'

const SocialNotifications = dynamic(() => import('./social-notifications').then(mod => mod.SocialNotifications), { ssr: false })

export function SocialNotificationsWrapper() {
  return <SocialNotifications />
}