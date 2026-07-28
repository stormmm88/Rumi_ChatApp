# RUMI Chat App

RUMI là ứng dụng chat realtime gồm frontend React và backend Express. Dự án hỗ trợ đăng ký, đăng nhập, quản lý bạn bè, tạo hội thoại cá nhân/nhóm, gửi tin nhắn realtime bằng Socket.IO và lưu trữ dữ liệu bằng MongoDB.

## Tính năng chính

- Xác thực người dùng bằng access token và refresh token qua cookie.
- Đăng ký, đăng nhập, đăng xuất và tự động refresh phiên đăng nhập.
- Tìm kiếm người dùng, gửi/chấp nhận/từ chối lời mời kết bạn.
- Tạo hội thoại trực tiếp hoặc nhóm.
- Gửi và nhận tin nhắn realtime với Socket.IO.
- Theo dõi trạng thái online của người dùng.
- Đánh dấu tin nhắn đã xem và hiển thị số tin nhắn chưa đọc.
- Upload avatar/ảnh thông qua Cloudinary.
- Giao diện React, Tailwind CSS, shadcn/radix UI, Zustand và React Router.
- Hỗ trợ dark mode.

## Công nghệ sử dụng

**Frontend**

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand
- Axios
- Socket.IO Client
- shadcn/radix UI, lucide-react, sonner

**Backend**

- Node.js
- Express 5
- TypeScript
- MongoDB và Mongoose
- Socket.IO
- JSON Web Token
- bcrypt
- Multer
- Cloudinary

## Cấu trúc thư mục

```text
rumi/
|-- backend/
|   |-- src/
|   |   |-- controllers/
|   |   |-- libs/
|   |   |-- middlewares/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- socket/
|   |   `-- server.ts
|   |-- package.json
|   `-- tsconfig.json
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- lib/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- stores/
|   |   `-- types/
|   |-- package.json
|   `-- vite.config.ts
|-- socketIO.md
`-- README.md
```

## Yêu cầu môi trường

- Node.js 20 hoặc mới hơn
- npm
- MongoDB local hoặc MongoDB Atlas
- Tài khoản Cloudinary để upload ảnh

## Cài đặt

Clone dự án và cài dependencies cho từng phần:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Cấu hình biến môi trường

Tạo file `backend/.env`:

```env
PORT=5001
MONGODB_CONNECTIONSTRING=mongodb+srv://<username>:<password>@<cluster>/<database>
CLIENT_URL=http://localhost:5173
ACCESS_TOKEN_SECRET=<your-access-token-secret>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
```

Tạo file `frontend/.env.development`:

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

Nếu deploy production, cập nhật `frontend/.env.production` theo domain thật:

```env
VITE_API_URL=https://your-api-domain.com/api
VITE_SOCKET_URL=https://your-api-domain.com
```

## Chạy dự án ở môi trường development

Mở terminal thứ nhất để chạy backend:

```bash
cd backend
npm run dev
```

Mở terminal thứ hai để chạy frontend:

```bash
cd frontend
npm run dev
```

Sau đó truy cập:

```text
http://localhost:5173
```

Backend mặc định chạy tại:

```text
http://localhost:5001
```

## Scripts

Backend:

```bash
npm run dev
npm start
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## API chính

Các route backend đang dùng prefix `/api`:

- `POST /api/auth/signup` - đăng ký
- `POST /api/auth/signin` - đăng nhập
- `POST /api/auth/signout` - đăng xuất
- `POST /api/auth/refresh` - làm mới access token
- `GET /api/friends` - lấy danh sách bạn bè
- `GET /api/friends/requests` - lấy lời mời kết bạn
- `POST /api/friends/requests` - gửi lời mời kết bạn
- `POST /api/friends/requests/:requestId/accept` - chấp nhận lời mời
- `POST /api/friends/requests/:requestId/decline` - từ chối lời mời
- `POST /api/conversations` - tạo hội thoại
- `GET /api/conversations` - lấy danh sách hội thoại
- `GET /api/conversations/:conversationId/messages` - lấy tin nhắn trong hội thoại
- `PATCH /api/conversations/:conversationId/seen` - đánh dấu đã xem

## Socket.IO

Socket server dùng cùng HTTP server backend. Client kết nối tới `VITE_SOCKET_URL` sau khi đăng nhập.

Một số event chính:

- `online-users` - server phát danh sách user đang online.
- `join-conversation` - client tham gia room của một hội thoại.
- `user:status` - client cập nhật trạng thái online/offline.

Xem thêm ghi chú trong `socketIO.md`.

## Build production

Build frontend:

```bash
cd frontend
npm run build
```

Backend hiện chạy từ `dist/server.js` khi dùng `npm start`, vì vậy cần đảm bảo có bước build TypeScript trước khi chạy production nếu thư mục `dist` chưa tồn tại.

## Ghi chú

- Không commit file `.env` có chứa secret thật.
- Đảm bảo `CLIENT_URL` ở backend trùng với origin của frontend để CORS và cookie hoạt động đúng.
- Frontend gửi cookie kèm request qua Axios `withCredentials`, vì vậy cấu hình CORS backend cần bật `credentials: true`.
