import { create } from 'zustand'
import { toast } from 'sonner'
import type { AuthState } from '@/types/store'
import { authService } from '@/services/authService'
import { persist } from 'zustand/middleware'
import { useChatStore } from './useChatStore'
import type { User } from '@/types/user'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      //định nghĩa state muốn lưu giá trị
      accessToken: null,
      user: null,
      loading: false,

      setAccessToken: (accessToken) => {
        set({ accessToken })
      },

      setUser: (user: User) => {
        set({ user })
      },

      //clearState: reset toàn bộ state về giá trị mặc định
      clearState: () => {
        set({ accessToken: null, user: null, loading: false })
        useChatStore.getState().reset()
        localStorage.clear()
        sessionStorage.clear()
      },
      //mục đích: tái sử dụng nhiều lần, ví dụ sau khi logout hoặc token hết hạn,
      //chỉ cần gọi clearState thì tòan bộ thông tin user sẽ bị xóa

      signUp: async (username, password, email, firstName, lastName) => {
        try {
          set({ loading: true })
          //set: hàm zustand cung cấp để cập nhật state trong store
          //gọi API
          await authService.signUp(
            username,
            password,
            email,
            firstName,
            lastName
          )

          toast.success(
            'Đăng kí thành công! Bạn sẽ được chuyển sang trang đăng nhập'
          )
        } catch (error) {
          console.error(error)
          toast.error('Đăng kí không thành công!')
        } finally {
          set({ loading: false })
        }
      },

      signIn: async (username, password) => {
        try {
          get().clearState()
          set({ loading: true })

          const { accessToken } = await authService.signIn(username, password)
          get().setAccessToken(accessToken)
          await get().fetchMe()
          useChatStore.getState().fetchConversations()
          toast.success('Chào mừng bạn quay lại với Rumi')
        } catch (error) {
          console.error(error)
          toast.error('Đăng nhập không thành công!')
        } finally {
          set({ loading: false })
        }
      },

      signOut: async () => {
        try {
          get().clearState()
          await authService.signOut()
          toast.success('Đăng xuất thành công')
        } catch (error) {
          console.error(error)
          toast.error('Lỗi xảy ra khi đăng xuất! Vui lòng thử lại!')
        } finally {
          set({ loading: false })
        }
      },

      fetchMe: async () => {
        try {
          set({ loading: true })
          const user = await authService.fetchMe()
          set({ user })
        } catch (error) {
          console.error(error)
          set({ user: null, accessToken: null })
          toast.error(
            'Có lỗi xảy ra khi lấy dữ liệu người dùng! Vui lòng thử lại'
          )
        } finally {
          set({ loading: false })
        }
      },

      refresh: async () => {
        try {
          set({ loading: true })
          const { user, fetchMe, setAccessToken } = get()
          const accessToken = await authService.refresh()
          setAccessToken(accessToken)
          if (!user) {
            await fetchMe()
          }
        } catch (error) {
          console.error(error)
          toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!')
          get().clearState()
        } finally {
          set({ loading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), //partialize cho phép chọn phần nào trong state sẽ được lưu
    }
  )
)
//set: cập nhập state
//get: lấy dữ liệu trong store
