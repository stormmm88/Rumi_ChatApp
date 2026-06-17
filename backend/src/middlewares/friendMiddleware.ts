import Conversation from "../models/Conversation";
import Friend from "../models/Friend";
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

const pair = (a: Types.ObjectId | string, b: Types.ObjectId | string) => {
  const strA = a.toString();
  const strB = b.toString();
  return strA < strB ? [strA, strB] : [strB, strA];
};
//sắp xếp thứ tự của userA và userB

export const checkFriendship = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    //lấy ra thông tin người đang đăng nhập
    const me = req.user._id.toString();
    const recipientId = req.body.recipientId ?? null;
    const memberIds = req.body?.memberIds ?? [];

    if (!recipientId && memberIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Cần cung cấp recipientId hoặc memberIds" });
    }

    if (recipientId) {
      const [userA, userB] = pair(me, recipientId);

      const isFriend = await Friend.findOne({ userA, userB });

      if (!isFriend) {
        return res
          .status(403)
          .json({ message: "Bạn chưa kết bạn với người này" });
      }

      return next();
    }

    //todo: chat nhóm

    const friendChecks = memberIds.map(async (memberId: string) => {
      const [userA, userB] = pair(me, memberId);
      //chuẩn hóa thứ tự 2 user trước khi truy vấn
      const friend = await Friend.findOne({ userA, userB });
      return friend ? null : memberId;
    });

    const results = await Promise.all(friendChecks);
    const notFriends = results.filter(Boolean); // lọc ra những memberId(các member không phải bạn bè).
    if (notFriends.length > 0) {
      return res
        .status(403)
        .json({ message: "Bạn chỉ có thể thêm bạn bè vào nhóm", notFriends });
    }

    next();
  } catch (error) {
    console.error("Lỗi xảy ra khi check Friendship", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const checkGroupMembership = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy cuộc trò chuyện" });
    }

    const isMember = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString(),
    );

    if (!isMember) {
      return res.status(403).json({ message: "Bạn không trong nhóm này." });
    }

    req.conversation = conversation;

    next();
  } catch (error) {
    console.error("Lỗi checkGroupMembership", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
