import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

interface IUserAvatar {
  type: 'sidebar' | 'chat' | 'profile'
  name: string
  avatarUrl?: string
  className?: string
}

const UserAvatar = ({ type, name, avatarUrl, className }: IUserAvatar) => {
  const bgColor = !avatarUrl ? 'bg-blue-500' : ''
  if (!name) {
    name = 'Rumi'
  }
  return (
    <Avatar
      className={cn(
        className ?? '',
        type === 'sidebar' && 'size-12 text-base',
        type === 'chat' && 'size-8 text-sm',
        type === 'profile' && 'size-16 text-3xl shadow-md'
      )}
    >
      <AvatarImage src={avatarUrl} alt={name} />
      <AvatarFallback className={`${bgColor} text-white font-semibold`}>
        {name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  )
}

export default UserAvatar
