//chứa các hàm tiện ích liên quan đến messageController
import { Types } from "mongoose";
import { IConversation } from "../models/Conversation";
import { IMessage } from "../models/Message";
import { Server } from "socket.io";

export const updateCACM = (
  conversation: IConversation,
  message: IMessage,
  senderId: Types.ObjectId | string,
) => {
  //Khi 1 tin nhắn gửi đi cần cập nhật danh sách ng xem tin nhắn(seenBy)
  //và tin nhắn cuối cùng (lastMessage)
  conversation.set({
    seenBy: [],
    lastMessageAt: message.createdAt,
    lastMessage: {
      _id: message._id,
      createdAt: message.createdAt,
      content: message.content,
      senderId,
    },
  });
  //Mỗi lần có tin nhắn mới cần reset số tin nhắn chưa đọc của người gửi về lại bằng 0
  //còn người nhận sẽ tăng thêm 1
  conversation.participants.forEach((p) => {
    const memberId = p.userId.toString();
    const isSender = memberId === senderId.toString();
    //so sánh memberId vs senderId, nếu bằng nhau thì member này chính là người gửi tin nhắn

    //lấy số tin nhắn chưa đọc hiện đại của member
    const prevCount = conversation.unreadCounts.get(memberId) || 0;

    //cập nhật lại số lượng tin nhắn chưa đọc của member
    conversation.unreadCounts.set(memberId, isSender ? 0 : prevCount + 1);
  });
};

//phát đi sự kiên new message vào 1 room
export const emitNewMessage = (
  io: Server,
  conversation: IConversation,
  message: IMessage,
) => {
  io.to(conversation._id.toString()).emit("new-message", {
    message,
    conversation: {
      _id: conversation._id,
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
    },
    unreadCounts: conversation.unreadCounts,
  });
};
