//Lưu state của conversation và message
import { chatService } from '@/services/chatService'
import type { ChatState } from '@/types/store'
import { create } from 'zustand'
import { persist } from 'zustand/middleware' //lưu dữ liệu chat trong storage nếu cần
import { useAuthStore } from './useAuthStore'
import { useSocketStore } from './useSocketStore'

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null,
      loading: false,
      convoLoading: false, //loading convo
      messageLoading: false, //loading message

      setActiveConversation: (id) => set({ activeConversationId: id }),
      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          convoLoading: false,
          messageLoading: false,
        })
      },
      fetchConversations: async () => {
        try {
          set({ convoLoading: true })
          const { conversations } = await chatService.fetchConversations()

          set({ conversations, convoLoading: false })
        } catch (error) {
          console.error('Lỗi xảy ra khi fetchConversations', error)
          set({ convoLoading: false })
        }
      },

      fetchMessages: async (conversationId) => {
        const { activeConversationId, messages } = get()
        const { user } = useAuthStore.getState()

        const convoId = conversationId ?? activeConversationId
        if (!convoId) return

        const current = messages?.[convoId]
        const nextCursor =
          current?.nextCursor === undefined ? '' : current?.nextCursor
        if (nextCursor === null) return

        set({ messageLoading: true })

        try {
          const { messages: fetched, cursor } = await chatService.fetchMessage(
            convoId,
            nextCursor
          )
          //Lưu mảng tin nhắn sau khi đã xử lý
          const processed = fetched.map((m) => ({
            ...m,
            isOwn: m.senderId === user?._id,
          }))
          set((state) => {
            const prev = state.messages[convoId]?.items ?? []
            const merged = prev.length > 0 ? [...processed, ...prev] : processed

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: merged,
                  hasMore: !!cursor,
                  nextCursor: cursor ?? null,
                },
              },
            }
          })
        } catch (error) {
          console.log('Lỗi xảy ra khi fetchMessages', error)
        } finally {
          set({ messageLoading: false })
        }
      },

      sendDirectMessage: async (recipientId, content, imgUrl) => {
        try {
          const { activeConversationId } = get()

          await chatService.sendDirectMessage(
            recipientId,
            content,
            imgUrl,
            activeConversationId || undefined
          )

          set((state) => ({
            //state: toàn bộ dữ giá trị dữ liệu của hiện tại,
            //dùng state khi muốn đọc giá trị cũ để tính toán giá trị mới
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId ? { ...c, seenBy: [] } : c
            ),
          }))
        } catch (error) {
          console.error('Lỗi khi gửi tin nhắn riêng', error)
        }
      },

      sendGroupMessage: async (conversationId, content, imgUrl) => {
        try {
          await chatService.sendGroupMessage(conversationId, content, imgUrl)
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === get().activeConversationId ? { ...c, seenBy: [] } : c
            ),
          }))
        } catch (error) {
          console.error('Lỗi xảy ra khi gửi tin nhắn nhóm', error)
        }
      },

      addMessage: async (message) => {
        try {
          const { user } = useAuthStore.getState()

          const { fetchMessages } = get()

          message.isOwn = message.senderId === user?._id

          const convoId = message.conversationId

          let prevItems = get().messages[convoId]?.items ?? []

          if (prevItems.length === 0) {
            await fetchMessages(message.conversationId)
            prevItems = get().messages[convoId]?.items ?? []
          }

          set((state) => {
            if (prevItems.some((m) => m._id === message._id)) {
              return state
            }

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: [...prevItems, message],
                  hasMore: state.messages[convoId]?.hasMore,
                  nextCursor: state.messages[convoId]?.nextCursor ?? undefined,
                },
              },
            }
          })
        } catch (error) {
          console.error('Lỗi xảy ra khi add message', error)
        }
      },

      updateConversation: async (conversation) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === conversation._id ? { ...c, ...conversation } : c
          ),
        }))
      },

      markAsSeen: async () => {
        try {
          const { user } = useAuthStore.getState()
          const { activeConversationId, conversations } = get()

          if (!activeConversationId || !user) {
            return
          }

          const convo = conversations.find(
            (c) => c._id === activeConversationId
          )

          if (!convo) {
            return
          }

          if ((convo.unreadCounts?.[user._id] ?? 0) === 0) {
            return
          }

          await chatService.markAsSeen(activeConversationId)

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId && c.lastMessage
                ? {
                    ...c,
                    unreadCounts: {
                      ...c.unreadCounts,
                      [user._id]: 0,
                    },
                  }
                : c
            ),
          }))
        } catch (error) {
          console.error('Lỗi xảy ra khi gọi markAsSeen trong store', error)
        }
      },

      addConvo: (convo) => {
        set((state) => {
          const exists = state.conversations.some(
            (c) => c._id.toString() === convo._id.toString()
          )

          return {
            conversations: exists
              ? state.conversations
              : [convo, ...state.conversations],
            activeConversationId: convo._id,
          }
        })
      },

      createConversation: async (type, name, memberIds) => {
        try {
          set({ loading: true })
          const conversation = await chatService.createConversation(
            type,
            name,
            memberIds
          )

          get().addConvo(conversation)

          // Fetch messages sau khi set active conversation
          await get().fetchMessages(conversation._id)

          useSocketStore
            .getState()
            .socket?.emit('join-conversation', conversation._id)
        } catch (error) {
          console.error(
            'Lỗi xảy ra khi gọi createConversation trong store',
            error
          )
        } finally {
          set({ loading: false })
        }
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ conversations: state.conversations }),
    }
  )
)
