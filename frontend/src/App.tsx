/* eslint-disable react-hooks/exhaustive-deps */
import { BrowserRouter, Route, Routes } from 'react-router'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import ChatAppPage from './pages/ChatAppPage'
import { Toaster } from 'sonner'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { TooltipProvider } from './components/ui/tooltip'
import { useThemeStore } from './stores/useThemeStore'
import { useEffect } from 'react'
import { useAuthStore } from './stores/useAuthStore'
import { useSocketStore } from './stores/useSocketStore'

function App() {
  const { isDark, setTheme } = useThemeStore()
  const { accessToken } = useAuthStore()
  const { connectSocket, disconnectSocket } = useSocketStore()

  useEffect(() => {
    setTheme(isDark)
  }, [isDark])

  useEffect(() => {
    if (accessToken) {
      connectSocket()
    }
    //cleanup sẽ chạy trước khi useEffect chạy lại hoặc khi app component unmount
    return () => disconnectSocket()
  }, [accessToken])

  return (
    <>
      {/* định nghĩa route để điều hướng tới các trang */}
      <Toaster richColors />
      {/* toaster: thư viện giúp hiển thị thông báo dạng popup */}
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* public routes */}
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* protected routes */}
            {/* todo: tạo protected route */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<ChatAppPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </>
  )
}

export default App
