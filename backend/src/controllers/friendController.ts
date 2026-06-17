//định nghĩa các hàm logic tương ứng với endpoint trong route

import { Request, Response } from "express";
import Friend from "../models/Friend";
import FriendRequest from "../models/FriendRequest";
import User from "../models/User";

export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const { to, message } = req.body;

    const from = req.user._id; //lấy userId từ authMiddleware

    if (to === from) {
      return res
        .status(400)
        .json({ message: "Bạn không thể gửi lời mời kết bạn cho chính mình" });
    }
    //kiểm tra xem user nhận lời mời có tồn tại không
    const userExists = await User.exists({ _id: to });

    if (!userExists) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    //kiểm tra 2 người đã mối quan hệ nào chưa (đã là bạn bè hoặc đã có lời mời kết bạn đang chờ xử lý)
    let userA = from.toString();
    let userB = to.toString();
    if (userA > userB) {
      [userA, userB] = [userB, userA];
    }
    const [alreadyFriends, existingRequest] = await Promise.all([
      Friend.findOne({ userA, userB }),
      FriendRequest.findOne({
        $or: [
          { from, to },
          { from: to, to: from },
        ],
      }),
    ]);

    if (alreadyFriends) {
      return res
        .status(400)
        .json({ message: "Bạn đã là bạn bè của người này" });
    }

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Đã tồn tại lời mời kết bạn giữa hai người" });
    }

    const request = await FriendRequest.create({
      from,
      to,
      message,
    });

    return res
      .status(201)
      .json({ message: "Gửi lời mời kết bạn thành công", request });
  } catch (error) {
    console.error("Lỗi khi gửi lời mời kết bạn", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;
    //tìm lời mời kết bạn
    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lời mời kết bạn" });
    }

    //chỉ người nhận mới có quyền chấp nhận lời mời
    if (request.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền chấp nhận lời mời kết bạn này." });
    }
    //khi có người gửi lời mời kết bạn cho bạn, xong gửi API request để tự động chấp nhận lời mời
    //thì không cần thông qua bạn mà họ vẫn có thể kết bạn được.

    //tạo mối quan hệ bạn bè
    const friend = await Friend.create({
      userA: request.from,
      userB: request.to,
    });
    //xóa lời mời kết bạn sau khi đã chấp nhận
    await FriendRequest.findByIdAndDelete(requestId);

    //lấy thông tin người gửi để trả về cho client
    const from = await User.findById(request.from)
      .select("_id displayName avatarUrl")
      .lean();
    //lean(): khi có lean() thì dữ liệu trả về là javaScript object thay vì Mongoose document.

    return res.status(200).json({
      message: "Chấp nhận lời mời kết bạn thành công",
      newFriend: {
        _id: friend._id,
        displayName: from?.displayName,
        avatarUrl: from?.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Lỗi khi chấp nhận lời mời kết bạn", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const declineFriendRequest = async (req: Request, res: Response) => {
  try {
    //lấy Id của lời mời kết bạn từ params url mà client gửi lên
    const { requestId } = req.params;
    const userId = req.user._id; //để biết người gửi request là ai.

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lời mời kết bạn" });
    }

    //chỉ người nhận mới có quyền từ chối lời mời
    if (request.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền từ chối lời mời kết bạn này." });
    }
    //xóa lời mời kết bạn
    await FriendRequest.findByIdAndDelete(requestId);
    return res.sendStatus(204); //204 No Content: yêu cầu đã thành công nhưng không trả về dữ liệu nào
  } catch (error) {
    console.error("Lỗi khi từ chối lời mời kết bạn", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const getAllFriends = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    const friendships = await Friend.find({
      $or: [{ userA: userId }, { userB: userId }],
    })
      .populate("userA", "displayName avatarUrl username")
      .populate("userB", "displayName avatarUrl username")
      .lean();

    if (!friendships.length) {
      return res.status(200).json({ friends: [] });
    }

    const friends = friendships.map((f) =>
      f.userA._id.toString() === userId.toString() ? f.userB : f.userA,
    );

    return res.status(200).json({ friends });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bạn bè", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const getFriendsRequests = async (req: Request, res: Response) => {
  try {
    //lấy thông tin user hiện tại được middleware auth gắn vào req.user
    const userId = req.user._id;

    //tạo biến chứa danh sách các trường mình muốn lấy
    const populateFields = "_id username displayName avatarUrl";

    const [sent, received] = await Promise.all([
      FriendRequest.find({ from: userId }).populate("to", populateFields),
      FriendRequest.find({ to: userId }).populate("from", populateFields),
    ]);
    //dùng Promise.all để thực hiện 2 truy vấn song song,
    //để lấy friend request mà user đã gửi đi và friend request mà user nhận được cùng lúc.

    return res.status(200).json({ sent, received });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách lời mời kết bạn", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
