//gọi API và trả kết quả về từ API

import api from '@/lib/axios'
import type { ConversationResponse, Message } from '@/types/chat'

interface FetchMessageProps {
  messages: Message[] //mảng chứa danh sách tin nhắn
  cursor?: string //lưu con trỏ phân trang
}

const pageLimit = 50

export const chatService = {
  async fetchConversations(): Promise<ConversationResponse> {
    const res = await api.get('/conversations')
    return res.data
  },

  //Hàm lấy danh sách tin nhắn
  async fetchMessage(id: string, cursor?: string): Promise<FetchMessageProps> {
    const res = await api.get(
      `/conversations/${id}/messages?limit=${pageLimit}&cursor=${cursor}`
    )
    return { messages: res.data.messages, cursor: res.data.nextCursor }
  },

  //Hàm gửi tin nhắn cho 1 người bạn
  async sendDirectMessage(
    recipientId: string,
    content: string = '',
    imgUrl?: string,
    conversationId?: string
  ) {
    const res = await api.post('/messages/direct', {
      recipientId,
      content,
      imgUrl,
      conversationId,
    })

    return res.data.message
  },

  //Hàm gửi tin nhắn cho nhóm chát
  async sendGroupMessage(
    conversationId?: string,
    content: string = '',
    imgUrl?: string
  ) {
    const res = await api.post('/messages/group', {
      conversationId,
      content,
      imgUrl,
    })

    return res.data.message
  },

  //hàm kiểm tra trạng thái tin nhắn (đã đọc hay chưa)
  async markAsSeen(conversationId: string) {
    const res = await api.patch(`conversations/${conversationId}/seen`)
    return res.data
  },

  //hàm tạo cuộc trò chuyện
  async createConversation(
    type: 'direct' | 'group',
    name: string,
    memberIds: string[]
  ) {
    const res = await api.post('/conversations', { type, name, memberIds })
    return res.data.conversation
  },
}
