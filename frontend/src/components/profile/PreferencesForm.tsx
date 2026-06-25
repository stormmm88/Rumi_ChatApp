import { useThemeStore } from '@/stores/useThemeStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Moon, Settings, Sun } from 'lucide-react'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { useUserStore } from '@/stores/useUserStore'

const PreferencesForm = () => {
  //lấy màu nền từ useThemeStore
  const { isDark, toggleTheme } = useThemeStore()

  const { onlineStatus, setOnlineStatus } = useUserStore()

  return (
    <Card className="glass-strong border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Tùy chỉnh ứng dụng
        </CardTitle>

        <CardDescription>
          Cá nhân hóa trải nghiệm trò chuyện của bạn
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Dark mode */}
        <div className="flex items-center justify-center">
          <div>
            <Label htmlFor="theme-toggle" className="text-base font-medium">
              Chế độ tối
            </Label>
            <p className="text-sm text-muted-foreground">
              Chuyển đổi giữa giao diện sáng và tối
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-muted-foreground" />
            <Switch
              id="theme-toggle"
              checked={isDark}
              onCheckedChange={toggleTheme}
              className="data-[state=checked]:bg-primary-glow"
            />
            <Moon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* online status */}
        <div className="flex items-center justify-center">
          <div>
            <Label htmlFor="online-status" className="text-base font-medium">
              Hiển thị trạng thái online
            </Label>
            <p className="text-sm text-muted-foreground">
              Cho phép người khác thấy khi bạn đang online
            </p>
          </div>
          <Switch
            id="online-status"
            checked={onlineStatus}
            onCheckedChange={setOnlineStatus}
            className="data-[state=checked]:bg-primary-glow"
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default PreferencesForm
