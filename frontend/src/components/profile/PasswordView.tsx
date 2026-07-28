import { useForm } from 'react-hook-form'
import { Button } from '../ui/button'
import { CardContent, CardDescription } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useAuthStore } from '@/stores/useAuthStore'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 kí tự'),
    confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu mới'),
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: 'Mật khẩu mới không được trùng mật khẩu cũ',
    path: ['newPassword'],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirmPassword'],
  })

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

const PasswordView = () => {
  const { changePassword } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange', //validate khi người dùng click ra khỏi field
  })

  const onSubmit = async (data: ChangePasswordForm) => {
    setLoading(true)
    try {
      const { oldPassword, newPassword } = data
      const success = await changePassword(oldPassword, newPassword)
      if (success) {
        reset()
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'glass border-border/50 focus:border-primary/50 transition-smooth'

  return (
    <CardContent className="space-y-4">
      <CardDescription>
        Để bảo vệ tài khoản, hãy chọn mật khẩu mạnh mà bạn chưa dùng ở đây trước
        đây.
      </CardDescription>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="oldPassword" className="text-sm font-semibold">
            Mật khẩu hiện tại
          </Label>
          <Input
            id="oldPassword"
            type="password"
            placeholder="••••••••"
            className={inputClass}
            {...register('oldPassword')}
          />
          {errors.oldPassword && (
            <p className="text-sm text-destructive">
              {errors.oldPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-semibold">
            Mật khẩu mới
          </Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="Ít nhất 6 ký tự"
            className={inputClass}
            {...register('newPassword')}
          />

          {errors.newPassword && (
            <p className="text-sm text-destructive">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-semibold">
            Nhập lại mật khẩu mới
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Xác nhận mật khẩu"
            className={inputClass}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => reset()}
          >
            Huỷ
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Đang lưu ...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </CardContent>
  )
}

export default PasswordView
