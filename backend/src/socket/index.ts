import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketAuthMiddleware } from "../middlewares/socketMiddleware";
import { getUserConversationsForSocketIO } from "../controllers/conversationController";

//Khởi tạo ứng dụng express
const app = express();

//khởi tạo http server dựa trên app
const server = http.createServer(app);

//tạo socket server
const io = new Server(server, {
  //cấu hình cors để FR kết nối
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

//BE lưu lại danh sách user đang online, mỗi khi có ai online hoặc offline
//thì phát đi tín hiệu mới với danh sách user online mới cho tất cả client
const onlineUsers = new Map(); //{userId: socketId}

io.use(socketAuthMiddleware);

//socket lắng nghe sự kiện kết nối
//sau khi nhận đc tín hiệu kết nối thì chạy hàm
io.on("connection", async (socket) => {
  const user = socket.User;
  console.log(`${user?.displayName} online với socket ${socket.id}`);

  onlineUsers.set(user?._id, socket.id);

  io.emit("online-users", Array.from(onlineUsers.keys()));

  const conversationIds = await getUserConversationsForSocketIO(user?._id);
  conversationIds.forEach((id) => {
    socket.join(id);
  });

  socket.on("join-conversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("user:status", ({ online }: { online: boolean }) => {
    if (online) {
      onlineUsers.set(user._id, socket.id);
    } else {
      onlineUsers.delete(user._id);
    }
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });

  //tại room theo user._id
  socket.join(user._id.toString());

  socket.on("disconnect", () => {
    onlineUsers.delete(user?._id);
    io.emit("online-users", Array.from(onlineUsers.keys()));
    console.log(`socket disconnectd: ${socket.id}`);
  });
});

export { io, app, server };
