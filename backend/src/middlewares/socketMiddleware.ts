import jwt from "jsonwebtoken";
import User from "../models/User";
import { Socket } from "socket.io";

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (error?: Error) => void,
) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Unauthorized - Token không tồn tại"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      userId: string;
    };
    if (!decoded) {
      return next(
        new Error("Unauthorized - Token không tồn tại hoặc đã hết hạn"),
      );
    }

    const user = await User.findById(decoded.userId).select("-hashedPassword");
    if (!user) {
      return next(new Error("User không tồn tại"));
    }

    socket.User = user;

    next();
  } catch (error) {
    console.error("Lỗi khi verify JWT trong socketMiddleware");
    next(new Error("Unauthorized"));
  }
};
