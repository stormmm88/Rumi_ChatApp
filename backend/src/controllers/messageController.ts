import { Request, Response } from "express";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import { emitNewMessage, updateCACM } from "../utils/messageHelper";
import { io } from "../socket/index";

export const sendDirectMessage = async (req: Request, res: Response) => {
  try {
    //lấy id người nhận và nội dung, id của cuộc hội thoại
    const { recipientId, content, conversationId } = req.body;
    const senderId = req.user._id; //lấy id người gửi

    let conversation; //lưu thông tin cuộc trò chuyện

    if (!content) {
      return res.status(400).json({ message: "Thiếu nội dung" });
    }

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      //tìm conversation trong document Conversation
    }

    if (!conversation) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [
          { userId: senderId, joinedAt: new Date() },
          { userId: recipientId, joinedAt: new Date() },
        ],
        lastMessageAt: new Date(),
        unreadCounts: new Map(),
      });
    }

    //tạo tin nhắn mới
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      content,
    });

    updateCACM(conversation, message, senderId);

    await conversation.save();

    emitNewMessage(io, conversation, message);

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi xảy ra khi gửi tin nhắn trực tiếp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const sendGroupMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation;

    if (!content) {
      return res.status(400).json({ message: "Thiếu nội dung" });
    }

    const message = await Message.create({
      conversationId,
      senderId,
      content,
    });

    updateCACM(conversation, message, senderId);

    await conversation.save();

    emitNewMessage(io, conversation, message);

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn nhóm", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
