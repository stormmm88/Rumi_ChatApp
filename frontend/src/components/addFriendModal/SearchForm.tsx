import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { IFormValues } from '../chat/AddFriendModal'
import type React from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { DialogClose, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Search } from 'lucide-react'

interface SearchFormProps {
  register: UseFormRegister<IFormValues>
  errors: FieldErrors<IFormValues>
  loading: boolean
  usernameValue: string
  isFound: boolean | null
  searchedUsername: string
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

const SearchForm = ({
  register,
  errors,
  loading,
  usernameValue,
  isFound,
  searchedUsername,
  onSubmit,
  onCancel,
}: SearchFormProps) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        <Label htmlFor="username" className="text-sm font-semibold">
          Tìm bằng user name
        </Label>

        <Input
          id="username"
          placeholder="Nhập tên user ..."
          className="glass border-border/50 focus:border-primary/50 transition-smooth"
          {...register('username', {
            required: 'User name không được bỏ trống',
          })}
        ></Input>

        {errors.username && (
          <p className="error-message">{errors.username.message}</p>
        )}

        {isFound === false && (
          <span className="error-message">
            Không tìm thấy
            <span className="font-semibold">@{searchedUsername}</span>
          </span>
        )}
      </div>

      <DialogFooter>
        <DialogClose asChild>
          {/* reset state của component cha về mặc định sau khi nhắn nút cancel */}
          <Button
            type="button"
            variant="outline"
            className="flex-1 glass hover:text-destructive"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </DialogClose>

        <Button
          type="submit"
          disabled={loading || !usernameValue?.trim()}
          className="flex-1 bg-gradient-chat text-white hover:opacity-90 transition-smooth"
        >
          {loading ? (
            <span>Đang tìm ...</span>
          ) : (
            <>
              <Search className="size-4 mr-2" />
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default SearchForm
