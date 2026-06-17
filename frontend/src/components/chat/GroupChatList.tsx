import { useChatStore } from '@/stores/useChatStore'
import GroupChatCard from './GroupChatCard'

const GroupChatList = () => {
  const { conversations } = useChatStore()

  if (!conversations) return

  const groupChats = conversations.filter((convo) => convo.type === 'group')
  return (
    <div>
      {groupChats.map((convo) => (
        <GroupChatCard convo={convo} key={convo._id} />
      ))}
    </div>
  )
}

export default GroupChatList
