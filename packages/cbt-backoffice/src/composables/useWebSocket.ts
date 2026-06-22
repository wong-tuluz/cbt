import { onMounted, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL as string
const socketUrl = API_URL.replace('/api', '')

export interface WebSocketConfig {
  rooms?: string[]
  onGlobalNotification?: (data: { type: string; id: string }) => void
  onPengerjaanNotification?: (data: { type: string; pengerjaanId: string; strike?: number }) => void
}

export function useWebSocket(config: WebSocketConfig) {
  let socket: Socket | null = null

  onMounted(() => {
    socket = io(socketUrl, {
      transports: ['websocket']
    })

    socket.on('connect', () => {
      console.log('WS: Connected to notification gateway')
      if (config.rooms && config.rooms.length > 0) {
        socket?.emit('join', { rooms: config.rooms })
      }
    })

    socket.on('disconnect', () => {
      console.log('WS: Disconnected from notification gateway')
    })

    if (config.onGlobalNotification) {
      socket.on('global_notification', config.onGlobalNotification)
    }

    if (config.onPengerjaanNotification) {
      socket.on('pengerjaan_notification', config.onPengerjaanNotification)
    }
  })

  onUnmounted(() => {
    if (socket) {
      socket.disconnect()
    }
  })
}
