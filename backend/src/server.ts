//khởi động server bằng express
import express from "express";
//để đọc giá trị trong env file, chúng ta sử dụng thư viện dotenv
import dotenv from "dotenv";
import { connectToDatabase } from "./libs/db";
import authRoute from "./routes/authRoute";
import userRoute from "./routes/userRoute";
import cookieParser from "cookie-parser";
import { protectedRoute } from "./middlewares/authMiddleware";
import cors from "cors";
import friendRoute from "./routes/friendRoute";
import messageRoute from "./routes/messageRoute";
import conversationRoute from "./routes/conversationRoute";
import { app, server } from "./socket";
import { v2 as cloudinary } from "cloudinary";

//gọi hàm config của dotenv để load các biến môi trường từ file .env vào process.env
dotenv.config();

//định nghĩa cổng mà server sẽ lắng nghe
const PORT = process.env.PORT || 5001;
//giá trị của PORT được lấy từ trang .env nếu có, nếu không sẽ mặc định là 5001

//thêm middleware
app.use(express.json()); //giúp express hiểu và đọc được request body dưới dạng JSON
app.use(cookieParser()); //giúp express đọc được cookie từ request header, cần thiết để xử lý refresh token khi client gửi yêu cầu làm mới access token
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

//Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

//public routes
app.use("/api/auth", authRoute);

//private routes
// app.use(protectedRoute)
app.use("/api/users", userRoute);
app.use("/api/friends", protectedRoute, friendRoute);
app.use("/api/messages", protectedRoute, messageRoute);
app.use("/api/conversations", protectedRoute, conversationRoute);

//cho server lắng nghe trên cổng đã định nghĩa
connectToDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
