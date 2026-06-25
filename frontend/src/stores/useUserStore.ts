import type { UserState } from '@/types/store'
import { create } from 'zustand'
import { useAuthStore } from './useAuthStore'
import { userService } from '@/services/userService'
import { toast } from 'sonner'
import { useChatStore } from './useChatStore'
import { useSocketStore } from './useSocketStore'

export const useUserStore = create<UserState>((set) => ({
  onlineStatus: false,
  setOnlineStatus: (status: boolean) => {
    set({ onlineStatus: status })
    useSocketStore.getState().socket?.emit('user:status', { online: status })
  },

  updateAvatarUrl: async (formData) => {
    try {
      const { user, setUser } = useAuthStore.getState()
      const data = await userService.uploadAvatar(formData)

      if (user) {
        setUser({
          ...user,
          avatarUrl: data.avatarUrl,
        })

        useChatStore.getState().fetchConversations()
      }
    } catch (error) {
      console.error('Lỗi khi updatedAvatarUrl', error)
      toast.error('Upload avatar không thành công!')
    }
  },

  updateUserInfo: async (userInfo) => {
    try {
      const { user, setUser } = useAuthStore.getState()
      const result = await userService.updateUserInfo(userInfo)

      if (user) {
        setUser({ ...user, ...result.data })
        toast.success('Cập nhật thông tin thành công')
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật userInfo', error)
      toast.error('Cập nhật thông tin người dùng lỗi')
    }
  },
}))
