import express from "express";
import {
  createConversation,
  getConversation,
  getMessages,
  markAsSeen,
} from "../controllers/conversationController";
import { checkFriendship } from "../middlewares/friendMiddleware";

const router = express.Router();

router.post("/", checkFriendship, createConversation);
router.get("/", getConversation);
router.get("/:conversationId/messages", getMessages);
router.patch("/:conversationId/seen", markAsSeen);

export default router;
