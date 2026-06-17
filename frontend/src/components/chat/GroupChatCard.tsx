import { useAuthStore } from '@/stores/useAuthStore'
import { useChatStore } from '@/stores/useChatStore'
import type { Conversation } from '@/types/chat'
import ChatCard from './ChatCard'
import UnreadCountBadge from './UnreadCountBadge'
import GroupChatAvatar from './GroupChatAvatar'

const GroupChatCard = ({ convo }: { convo: Conversation }) => {
  const { user } = useAuthStore()

  const {
    activeConversationId,
    setActiveConversation,
    messages,
    fetchMessages,
  } = useChatStore()
  if (!user) return null

  const nameGroup = convo.group?.name ?? ''
  const unreadCount = convo.unreadCounts[user._id]

  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id)
    if (!messages[id]) {
      //todo: fetch Messages
      await fetchMessages()
    }
  }
  return (
    <ChatCard
      convoId={convo._id}
      name={nameGroup}
      timestamp={
        convo.lastMessage?.createdAt
          ? new Date(convo.lastMessage.createdAt)
          : undefined
      }
      isActive={activeConversationId === convo._id}
      onSelect={handleSelectConversation}
      unreadCount={unreadCount}
      leftSection={
        <>
          {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount} />}
          <GroupChatAvatar type="chat" participants={convo.participants} />
        </>
      }
      subtitle={
        <p className="text-sm truncate text-muted-foreground ">
          {convo.participants.length} thành viên
        </p>
      }
    />
  )
}

export default GroupChatCard
