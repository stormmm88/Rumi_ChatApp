import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getAllFriends,
  getFriendsRequests,
} from "../controllers/friendController";

//tạo đối tượng router
const router = express.Router();

//định nghĩa route cho gửi lời mời kết bạn
router.post("/requests", sendFriendRequest);

//định nghĩa route cho chấp nhận lời mời kết bạn
router.post("/requests/:requestId/accept", acceptFriendRequest);

//định nghĩa route cho từ chối lời mời kết bạn
router.post("/requests/:requestId/decline", declineFriendRequest);

router.get("/", getAllFriends);

router.get("/requests", getFriendsRequests);

export default router;
