import type { Socket } from 'socket.io-client'
import type { Conversation, Message } from './chat'
import type { Friend, FriendRequest, User } from './user'

export interface AuthState {
  accessToken: string | null
  user: User | null
  loading: boolean

  setAccessToken: (accessonToken: string) => void
  clearState: () => void
  setUser: (user: User) => void

  signUp: (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string
  ) => Promise<void>

  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  fetchMe: () => Promise<void>
  refresh: () => Promise<void>
}

export interface ThemeState {
  isDark: boolean
  toggleTheme: () => void
  setTheme: (dark: boolean) => void
}

export interface ChatState {
  conversations: Conversation[]
  messages: Record<
    string,
    {
      items: Message[]
      hasMore: boolean //Cờ để biết còn tin nhắn cũ hay không, dùng để xử lý infinite-scroll
      nextCursor?: string | null //phân trang, cursor: con trỏ để biết lần fetch messages tiếp theo bắt đầu từ đâu
    }
  > //map từng cuộc hội thoại với tin nhắn của cuộc hội thoai đó
  activeConversationId: string | null //lưu giá tri của cuộc hội thoại mà người dùng đang mở
  convoLoading: boolean //theo dõi trạng thái request
  messageLoading: boolean //loading message
  loading: boolean
  reset: () => void //reset các state về lại mặc định

  setActiveConversation: (id: string | null) => void //những comps khác cập nhật giá trị của activeConversationId
  fetchConversations: () => Promise<void>
  fetchMessages: (conversationId?: string) => Promise<void>
  sendDirectMessage: (
    recipientId: string,
    content: string,
    imgUrl?: string
    // conversationId: string,
  ) => Promise<void>
  sendGroupMessage: (
    conversationId: string,
    content: string,
    imgUrl?: string
  ) => Promise<void>
  addMessage: (message: Message) => Promise<void>
  updateConversation: (conversation: Conversation) => Promise<void>
  markAsSeen: () => Promise<void>
  addConvo: (convo: Conversation) => void
  createConversation: (
    type: 'direct' | 'group',
    name: string,
    memberIds: string[]
  ) => Promise<void>
}

export interface SocketState {
  socket: Socket | null
  onlineUsers: string[] //đại diên cho tất cả users đang online
  connectSocket: () => void
  disconnectSocket: () => void
}
//bắt sự kiên online/offline của người dùng để cập nhật state

//tạo interface định nghĩa type cho friend Store
export interface FriendState {
  friends: Friend[]
  loading: boolean
  receivedList: FriendRequest[]
  sentList: FriendRequest[]
  searchByUsername: (username: string) => Promise<User | null>
  addFriend: (to: string, message?: string) => Promise<string>
  getAllFriendRequests: () => Promise<void>
  acceptRequest: (requestId: string) => Promise<void>
  declineRequest: (requestId: string) => Promise<void>
  getFriends: () => Promise<void>
}

export interface UserState {
  updateAvatarUrl: (formData: FormData) => Promise<void>
}
