import express from "express";
import {
  authMe,
  searchUserByUsername,
  updateUserInfo,
  uploadAvatar,
} from "../controllers/userController";
import { protectedRoute } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/uploadMiddleware";

//tạo đối tượng router
const router = express.Router();

//định nghĩa route cho đăng ký
router.get("/me", protectedRoute, authMe);

//định nghĩa route tìm người dùng
router.get("/search", searchUserByUsername);

router.post("/uploadAvatar", upload.single("file"), uploadAvatar);

router.patch("/me", protectedRoute, updateUserInfo);

export default router;
