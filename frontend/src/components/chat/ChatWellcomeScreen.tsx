import { SidebarInset } from '../ui/sidebar'
import ChatWindowHeader from './ChatWindowHeader'

const ChatWelcomeScreen = () => {
  return (
    <SidebarInset className="flex w-full h-full bg-transparent">
      <ChatWindowHeader />
      <div className="flex bg-primary-foreground rounded-2xl flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-5 px-6 text-center max-w-sm">
          {/* Icon container */}
          <div className="relative">
            <div
              className="size-20 bg-gradient-chat rounded-full flex items-center 
              justify-center shadow-glow"
            >
              <svg
                className="size-9 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                />
              </svg>
            </div>
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-gradient-chat opacity-20 pulse-ring" />
          </div>

          {/* Text */}
          <div className="flex flex-col gap-2">
            <h2
              className="text-2xl font-semibold tracking-tight bg-gradient-chat 
              bg-clip-text text-transparent"
            >
              Chào mừng đến với Rumi
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chọn một cuộc hội thoại bên trái để bắt đầu nhắn tin.
            </p>
          </div>

          {/* Hint chips */}
          <div className="flex flex-wrap gap-2 justify-center mt-1">
            {['Tìm cuộc trò chuyện', 'Tạo chat mới'].map((hint) => (
              <span
                key={hint}
                className="px-3 py-1.5 rounded-full text-xs font-medium 
                bg-muted text-muted-foreground border border-border"
              >
                {hint}
              </span>
            ))}
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}

export default ChatWelcomeScreen
