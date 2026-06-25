import { Request, Response } from "express";
import User from "../models/User";
import { uploadImageFromBuffer } from "../middlewares/uploadMiddleware";

export const authMe = async (req: Request, res: Response) => {
  try {
    const user = req.user; //lấy từ authMiddleware

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Lỗi khi gọi authMe", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

//logic tìm user theo userName
export const searchUserByUsername = async (req: Request, res: Response) => {
  try {
    //Lấy username từ req query
    const { username } = req.query;
    //req.query trả về kiểu string | ParsedQs | string[] | ParsedQs[],
    //không phải string, nên .trim() sẽ báo lỗi TypeScript. Cần ép kiểu

    //Kiểm tra nếu không có username hoặc username rỗng thì trả về lỗi 400
    if (!username || typeof username !== "string" || username.trim() === "") {
      return res
        .status(400)
        .json({ message: "Cần cung cấp username trong query." });
    }

    //nếu input hợp lệ thì query user
    const user = await User.findOne({ username }).select(
      "_id displayName username avatarUrl",
    );

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user." });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Lỗi xảy ra khi searchUserByUsername", error); // nên log cả error
    return res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    const userId = req.user._id;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await uploadImageFromBuffer(file.buffer);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        avatarUrl: result.secure_url,
        avatarId: result.public_id,
      },
      {
        new: true,
      },
    ).select("avatarUrl");

    if (!updatedUser?.avatarUrl) {
      return res.status(400).json({ message: "Avatar trả về null" });
    }

    return res.status(200).json({ avatarUrl: updatedUser.avatarUrl });
  } catch (error) {
    console.error("Lỗi xảy ra khi upload avatar", error);
    return res.status(500).json({ message: "Upload failed" });
  }
};

//hàm cập nhật thông tin người dùng
export const updateUserInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { displayName, username, email, phone, bio } = req.body;

    // Lọc bỏ các field undefined
    const updateData = Object.fromEntries(
      Object.entries({ displayName, username, email, phone, bio }).filter(
        ([_, value]) => value !== undefined,
      ),
    );

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
    }

    const updatedUserInfo = await User.findByIdAndUpdate(
      userId,
      { $set: updateData }, // ✅ chỉ set field có giá trị
      { new: true, runValidators: true },
    ).select("displayName username email phone bio");

    if (!updatedUserInfo) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    return res.status(200).json({ data: updatedUserInfo });
  } catch (error) {
    console.error("Lỗi khi update userInfo", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
