/* eslint-disable @typescript-eslint/no-explicit-any */
import { useThemeStore } from '@/stores/useThemeStore'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Smile } from 'lucide-react'
import EmojiPicker, { Theme, type EmojiClickData } from 'emoji-picker-react'

interface EmojiPickerProps {
  onChange: (value: string) => void
}

const EmojiPickerInput = ({ onChange }: EmojiPickerProps) => {
  const { isDark } = useThemeStore()

  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer">
        <Smile className="size-4" />
      </PopoverTrigger>

      <PopoverContent
        side="right"
        sideOffset={48}
        className="bg-transparent border-none shadow-none drop-shadow-none mb-12"
      >
        <EmojiPicker
          theme={isDark ? Theme.DARK : Theme.LIGHT}
          onEmojiClick={(emojiData: EmojiClickData) =>
            onChange(emojiData.emoji)
          }
        />
      </PopoverContent>
    </Popover>
  )
}

export default EmojiPickerInput
