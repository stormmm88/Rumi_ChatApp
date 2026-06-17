import express from "express";
import {
  authMe,
  searchUserByUsername,
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

export default router;
