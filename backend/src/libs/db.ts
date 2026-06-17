import mongoose from "mongoose";

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING as string);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    // Nếu kết nối thất bại, thoát khỏi ứng dụng
    process.exit(1);
  }
};