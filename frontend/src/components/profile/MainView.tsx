import { Bell, KeyRound, ShieldBan } from 'lucide-react'
import { Button } from '../ui/button'
import { CardContent } from '../ui/card'
import type { Dispatch, SetStateAction } from 'react'

type MainViewProps = {
  onSelect: Dispatch<SetStateAction<'main' | 'password' | 'notif' | 'block'>>
}

const MainView = ({ onSelect }: MainViewProps) => {
  return (
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full justify-start glass-light border-border/30 hover:text-warning"
          onClick={() => onSelect('password')}
        >
          <KeyRound className="h-4 w-4 mr-2" />
          Đổi mật khẩu
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start glass-light border-border/30 hover:text-info"
        >
          <Bell className="h-4 w-4 mr-2" />
          Cài đặt thông báo
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start glass-light border-border/30 hover:text-destructive"
        >
          <ShieldBan className="size-4 mr-2" />
          Chặn & Báo cáo
        </Button>
      </div>

      <div className="pt-4 border-t border-border/30">
        <h4 className="font-medium mb-3 text-destructive">Khu vực nguy hiểm</h4>
        <Button variant="destructive" className="w-full">
          Xoá tài khoản
        </Button>
      </div>
    </CardContent>
  )
}

export default MainView
