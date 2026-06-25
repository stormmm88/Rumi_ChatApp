import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { UserPlus } from 'lucide-react'
import type { User } from '@/types/user'
import { useFriendStore } from '@/stores/useFriendStore'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import SearchForm from '../addFriendModal/SearchForm'
import SendFriendRequestForm from '../addFriendModal/SendFriendRequestForm'
import { useWatch } from 'react-hook-form'

export interface IFormValues {
  username: string
  message?: string
}

const AddFriendModal = () => {
  //tạo state để lưu kết quả tìm kiếm user, UI hanlde 3 trạng thái (chưa tìm, đã tìm thấy, ko tìm thấy)
  const [isFound, setIsFound] = useState<boolean | null>(null)
  const [searchUser, setSearchUser] = useState<User>()
  const [searchedUsername, setSearchedUsername] = useState('')
  const { loading, searchByUsername, addFriend } = useFriendStore()

  const {
    register, //kết nối các input
    handleSubmit, //xử lý khi submit form
    control, //theo dỗi giá trị đang gõ
    reset, //reset form
    formState: { errors }, //hiển thị lỗi
  } = useForm<IFormValues>({ defaultValues: { username: '', message: '' } })

  //tạo biến username value để lưu giá trị user name khi người dùng gõ
  const usernameValue = useWatch({ control, name: 'username' })
  //watch theo dõi input và lấy giá trị realtime mà không cần bấn submit
  //khi reset form thì giá trị usernameValue cũng đc reset theo.

  const handleSearch = handleSubmit(async (data) => {
    const username = data.username.trim()
    if (!username) return

    setIsFound(null)
    setSearchedUsername(username)

    try {
      const foundUser = await searchByUsername(username)
      if (foundUser) {
        setIsFound(true)
        setSearchUser(foundUser)
      } else {
        setIsFound(false)
      }
    } catch (error) {
      console.error(error)
      setIsFound(false)
    }
  })

  //hàm xử lý yêu cầu kết bạn
  const handleSend = handleSubmit(async (data) => {
    if (!searchUser) return

    try {
      const message = await addFriend(searchUser._id, data.message?.trim())
      toast.success(message)

      handelCancel()
    } catch (error) {
      console.error('Lỗi xảy ra khi gửi request từ form', error)
    }
  })

  //hàm để reset toàn bộ trạng thái mỗi khi đóng modal hoặc gửi thành công
  const handelCancel = () => {
    reset()
    setSearchedUsername('')
    setIsFound(null)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className="flex items-center justify-center size-5 rounded-full
          hover:bg-sidebar-accent cursor-pointer z-10"
        >
          <UserPlus className="size-5" />
          <span className="sr-only">Kết bạn</span>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25 border-none">
        <DialogHeader>
          <DialogTitle>Kết bạn</DialogTitle>

          {!isFound && (
            <>
              <SearchForm
                register={register}
                errors={errors}
                usernameValue={usernameValue}
                loading={loading}
                isFound={isFound}
                searchedUsername={searchedUsername}
                onSubmit={handleSearch}
                onCancel={handelCancel}
              />
            </>
          )}

          {isFound && (
            <>
              <SendFriendRequestForm
                register={register}
                loading={loading}
                searchedUsername={searchedUsername}
                onSubmit={handleSend}
                onBack={() => setIsFound(null)}
              />
            </>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default AddFriendModal
