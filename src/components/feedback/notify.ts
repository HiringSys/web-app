import { reactive } from 'vue'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface NotificationState {
  visible:  boolean
  message:  string
  type:     NotificationType
  duration: number
  timer:    ReturnType<typeof setTimeout> | null
}

export const notificationState = reactive<NotificationState>({
  visible:  false,
  message:  '',
  type:     'info',
  duration: 3000,
  timer:    null,
})

export function notify(message: string, type: NotificationType = 'info', duration = 3000): void {
  if (notificationState.timer) clearTimeout(notificationState.timer)

  notificationState.message  = message
  notificationState.type     = type
  notificationState.duration = duration
  notificationState.visible  = true

  notificationState.timer = setTimeout(() => {
    notificationState.visible = false
  }, duration)
}
