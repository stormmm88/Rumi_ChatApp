/* eslint-disable react-hooks/exhaustive-deps */
import { useChatStore } from '@/stores/useChatStore'
import ChatWellcomeScreen from './ChatWellcomeScreen'
import MessageItem from './MessageItem'
import { useLayoutEffect, useMemo, useRef } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

const ChatWindowBody = () => {
  const {
    activeConversationId,
    conversations,
    messages: allMessages,
    fetchMessages,
  } = useChatStore()

  const messages = allMessages[activeConversationId!]?.items ?? []
  //Đổi chiều hiển thị messages khi scroll tin nhắn cũ
  const reversedMessages = [...messages].reverse()
  const hashMore = allMessages[activeConversationId!]?.hasMore ?? false
  const selectedConvo = conversations.find(
    (c) => c._id === activeConversationId
  )
  //tạo biến chứa tên của key lưu trong session storage
  const key = `chat-scroll-${activeConversationId}` //vì mỗi conversation là 1 cặp key-value riêng

  //ref
  const MessageEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const lastMessageStatus = useMemo(() => {
    const lastMessage = selectedConvo?.lastMessage
    if (!lastMessage) return 'delivered'

    const seenBy = selectedConvo?.seenBy ?? []
    return seenBy.length > 0 ? 'seen' : 'delivered'
  }, [selectedConvo])

  //Kéo xuống dưới khi load convo
  //useLayoutEffect chạy ngay sau khi react cập nhập DOM và trước khi trình duyệt vẽ lại layout
  //khi cần làm những thao tác liên quan đến layout như cuộn hay tính toán vị trí
  useLayoutEffect(() => {
    if (!MessageEndRef.current) return

    MessageEndRef.current.scrollIntoView({
      // behavior: 'smooth',
      block: 'end',
    })
  }, [activeConversationId])

  //hàm load thêm tin nhắn khi người dùng kéo lên trên
  const fetchMoreMessages = async () => {
    if (!activeConversationId) return

    try {
      await fetchMessages(activeConversationId)
    } catch (error) {
      console.error('Lỗi xảy ra khi fetch thêm tin nhắn', error)
    }
  }

  //hàm lưu vị trí cuộn hiện tại
  const handleScrollSave = () => {
    const container = containerRef.current

    if (!container && !activeConversationId) {
      return
    }

    sessionStorage.setItem(
      key,
      JSON.stringify({
        scrollTop: container?.scrollTop, //scrollTop: vị trí cuộn hiện tại
        scrollHeight: container?.scrollHeight, //scrollHeight: tổng chiều cao có thể cuộn được
      })
    )
  }

  //Cuộn tới vị trí đã lưu ở trong sessionStorage khi component render
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const item = sessionStorage.getItem(key)
    if (item) {
      const { scrollTop } = JSON.parse(item)
      //requestAnimationFrame: đảm bảo khi trình duyệt tính xong layout mới chạy hàm callback bên trong
      requestAnimationFrame(() => {
        container.scrollTop = scrollTop
      })
    }
  }, [messages.length])

  if (!selectedConvo) {
    return <ChatWellcomeScreen />
  }

  if (!messages.length) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Chưa có tin nhắn nào trong cuộc hội thoại này!
      </div>
    )
  }

  return (
    <div className="p-4 bg-primary-foreground h-full flex flex-col overflow-hidden">
      <div
        ref={containerRef}
        id="scrollableDiv"
        onScroll={handleScrollSave}
        className="flex flex-col-reverse overflow-y-auto overflow-x-hidden beautiful-scrollbar"
      >
        {/* đóng vai trò như cột mốc để khung chat biết cần cuộn tới đâu */}
        <div ref={MessageEndRef}></div>
        <InfiniteScroll
          dataLength={messages.length}
          next={fetchMoreMessages}
          hasMore={hashMore}
          scrollableTarget="scrollableDiv"
          loader={<p>Đang tải ...</p>}
          inverse={true} //kích hoạt khi kéo lên
          style={{
            display: 'flex',
            flexDirection: 'column-reverse',
            overflow: 'visible',
          }}
        >
          {reversedMessages.map((message, index) => (
            <MessageItem
              key={message._id ?? index}
              index={index}
              message={message}
              messages={reversedMessages}
              selectedConvo={selectedConvo}
              lastMessageStatus={lastMessageStatus}
            />
          ))}
        </InfiniteScroll>
      </div>
    </div>
  )
}

export default ChatWindowBody
