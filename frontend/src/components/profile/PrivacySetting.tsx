import { Shield } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { useState } from 'react'
import MainView from './MainView'
import PasswordView from './PasswordView'

const PrivacySettings = () => {
  const [view, setView] = useState<'main' | 'password' | 'notif' | 'block'>(
    'main'
  )

  return (
    <Card className="glass-strong border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Quyền riêng tư & Bảo mật
        </CardTitle>
        <CardDescription>
          Quản lý cài đặt quyền riêng tư và bảo mật của bạn
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {view === 'main' && <MainView onSelect={setView} />}
        {view === 'password' && <PasswordView />}
      </CardContent>
    </Card>
  )
}

export default PrivacySettings
