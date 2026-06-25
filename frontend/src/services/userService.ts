import api from '@/lib/axios'
import type { UpdateUserPayload } from '@/types/user'

export const userService = {
  uploadAvatar: async (formData: FormData) => {
    const res = await api.post('/users/uploadAvatar', formData, {
      headers: { 'Content-Type': 'multipart/formData' },
    })
    if (res.status === 400) {
      throw new Error(res.data.message)
    }
    return res.data
  },

  updateUserInfo: async (userInfo: UpdateUserPayload) => {
    const res = await api.patch(`/users/me`, userInfo)
    return res.data
  },
}
