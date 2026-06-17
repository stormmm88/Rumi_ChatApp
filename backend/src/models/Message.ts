import mongoose from "mongoose";

export interface IMessage extends mongoose.Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation", //tham chiếu đến model Conversation để dễ dàng truy xuất thông tin
      required: true,
      index: true, //tạo index trên trường conversationId để tăng hiệu suất khi tìm kiếm tin nhắn theo conversationId
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //tham chiếu đến model User để dễ dàng truy xuất thông tin người gửi khi cần
      required: true,
    },
    content: {
      type: String,
      trim: true, //tự động loại bỏ khoảng trắng ở đầu và cuối nội dung tin nhắn
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true, //tự động thêm createdAt và updatedAt vào mỗi document
  },
);
//tạo ra 1 bảng tra cứu, trong đó dữ liệu được sắp xếp conversationId trước với thứ tự tăng dần,
//rồi theo createdAt với thứ tự giảm dần. Khi truy vấn tin nhắn của cuộc hội thoại, thì tin nhắn có cùng conversationId sẽ nằm cùng nhau và sắp xếp theo thứ từ mới tới cũ.
//index: cách db tạo ra bảng tra cứu nhanh
//index kết hợp: loại index bao gồm nhiều trường, trong trường hợp này là conversationId và createdAt
//trong mongodb 1 là sắp xếp tăng dần, -1 là sắp xếp giảm dần

const Message = mongoose.model("Message", messageSchema);

export default Message;
