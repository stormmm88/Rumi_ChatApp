import { create } from 'zustand'
import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from './useAuthStore'
import type { SocketState } from '@/types/store'
import { useChatStore } from './useChatStore'

//khi báo đường dẫn để socket connect lên server
const baseURL = import.meta.env.VITE_SOCKET_URL

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],
  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken
    const existingSocket = get().socket

    if (existingSocket?.connected) return

    const socket: Socket = io(baseURL, {
      auth: { token: accessToken },
      transports: ['websocket'],
    })

    set({ socket })

    socket.on('connect', () => {
      console.log('Đã kết nối với socket')
    })

    //Lắng nghe sự kiên online user từ BE
    socket.on('online-users', (userIds) => {
      set({ onlineUsers: userIds })
    })

    //lắng nghe sự kiện new mesage
    socket.on('new-message', ({ message, conversation, unreadCounts }) => {
      useChatStore.getState().addMessage(message)

      const lastMessage = {
        _id: conversation.lastMessage._id,
        content: conversation.lastMessage.content,
        createdAt: conversation.lastMessage.createdAt,
        sender: {
          _id: conversation.lastMessage.senderId,
          displayName: '',
          avatarUrl: null,
        },
      }

      const updatedConversation = {
        ...conversation,
        lastMessage,
        unreadCounts,
      }

      if (
        useChatStore.getState().activeConversationId === message.conversationId
      ) {
        //đánh dấu đã đọc
        useChatStore.getState().markAsSeen()
      }

      useChatStore.getState().updateConversation(updatedConversation)
    })

    //Lắng nghe sự kiện read-message
    socket.on('read-message', ({ conversation, lastMessage }) => {
      const updated = {
        ...conversation,
        lastMessage,
      }
      useChatStore.getState().updateConversation(updated)
    })

    socket.on('connect_error', (error) => {
      console.error('Lỗi kết nối socket:', error.message)
      set({ socket: null })
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket ngắt kết nối:', reason)
    })

    //lắng nghe sự kiện new group
    socket.on('new-group', (conversation) => {
      useChatStore.getState().addConvo(conversation)
      socket.emit('join-conversation', conversation._id)
    })
  },

  disconnectSocket: () => {
    const socket = get().socket
    if (socket) {
      socket.disconnect()
      set({ socket: null })
    }
  },
}))
