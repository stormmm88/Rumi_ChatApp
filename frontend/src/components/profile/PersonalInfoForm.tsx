import type { UpdateUserPayload, User } from '@/types/user'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import type React from 'react'
import { useState } from 'react'
import { useUserStore } from '@/stores/useUserStore'

//khai báo kiểu dữ liệu cho table field
type EditTableField = {
  key: keyof Pick<User, 'displayName' | 'username' | 'phone' | 'email'>
  label: string
  type?: string
}

//định nghĩa key và label cho table field
const PERSONAL_FILED: EditTableField[] = [
  { key: 'displayName', label: 'Tên hiển thị' },
  { key: 'username', label: 'Tên người dùng' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Số điện thoại' },
]

//khai báo kiểu dữ liệu cho props component
type Props = {
  userInfo: User | null
}

const PersonalInfoForm = ({ userInfo }: Props) => {
  const [form, setForm] = useState<UpdateUserPayload>({
    displayName: userInfo?.displayName ?? '',
    username: userInfo?.username ?? '',
    email: userInfo?.email ?? '',
    phone: userInfo?.phone,
    bio: userInfo?.bio,
  })

  const { updateUserInfo } = useUserStore()
  //Kiểm tra thông tin người dùng
  if (!userInfo) return null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    await updateUserInfo(form)
  }

  return (
    <Card className="glass-strong border-border/30">
      {/* Card header gồm card title và card description */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Thông tin cá nhân
        </CardTitle>

        <CardDescription>
          Cập nhật chi tiết cá nhân và thông tin hồ sơ của bạn
        </CardDescription>
      </CardHeader>

      {/* Card content Textara cho field bio và Input cho các filed còn lại */}
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PERSONAL_FILED.map(({ key, label, type }) => (
            <div className="space-y-2" key={key}>
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                name={key}
                type={type ?? 'text'}
                value={form[key] ?? ''}
                onChange={handleChange}
                className="glass-light border-border/30"
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Giới thiệu</Label>
          <Textarea
            id="bio"
            rows={3}
            name="bio"
            value={form.bio ?? ''}
            onChange={handleChange}
            className="glass-light border-border/30 resize-none"
          />
        </div>

        {/* Nút bấm "Lưu thay đổi" */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            className="w-full md:w-auto bg-gradient-primary hover:opacity-90 
            transition-opacity"
            onClick={handleSubmit}
          >
            Lưu thay đổi
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default PersonalInfoForm
