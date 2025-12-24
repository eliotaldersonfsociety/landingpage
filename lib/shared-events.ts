// Shared in-memory events store
export let recentEvents: any[] = []

export function addEvent(event: any) {
  recentEvents.push(event)
  // Keep only last 100 events
  if (recentEvents.length > 100) {
    recentEvents = recentEvents.slice(-100)
  }
}

export function getRecentEvents() {
  return recentEvents.slice(-50)
}