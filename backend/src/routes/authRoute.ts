import express from "express";
import {
  signIn,
  signUp,
  signOut,
  refresh,
} from "../controllers/authController";

//tạo đối tượng router
const router = express.Router();

//định nghĩa route cho đăng ký
router.post("/signup", signUp);

//định nghĩa route cho đăng nhập
router.post("/signin", signIn);

//định nghĩa route cho đăng xuất
router.post("/signout", signOut);

//định nghĩa route refeshtoken
router.post("/refresh", refresh);

export default router;
