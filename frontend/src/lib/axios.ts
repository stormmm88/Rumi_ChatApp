import { useAuthStore } from '@/stores/useAuthStore'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  //baseURL tự động đổi theo môi trường(nếu đang code local thì gọi server ở localhost)
  //khi deploy lên production thì dùng chung domain với backend
  withCredentials: true, //không có dòng này thì cookie sẽ không đc gửi lên server và user sẽ bị logout liên tục
})

//gắn accessToken vào req header
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  //useAuthStore.getState(): chỉ lấy accessToken tại thời điểm dòng code chạy
  //nếu accessToken trong store thay đổi thì accessToken trong hàm này giữ nguyên

  if (accessToken) {
    config.headers.Authorization = `Bear ${accessToken}`
  }

  return config
})

//tự động gọi refresh api khi access token hết hạn
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config

    //những API không cần check
    if (
      originalRequest.url.includes('/auth/signin') ||
      originalRequest.url.includes('/auth/signup') ||
      originalRequest.url.includes('/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    originalRequest._retryCount = originalRequest._retryCount || 0

    if (error.response?.status === 403 && originalRequest._retryCount < 4) {
      originalRequest._retryCount += 1
      try {
        const res = await api.post('auth/refresh', { withCridentials: true })
        const newAccessToken = res.data.accessToken
        useAuthStore.getState().setAccessToken(newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().clearState()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
