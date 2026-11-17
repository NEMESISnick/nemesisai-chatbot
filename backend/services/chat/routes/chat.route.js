import express from "express";
import { createConversation, getAllMessages, getConversations, saveMessage, updateConversations } from "../controllers/chat.conversation.js";

const router = express.Router()

router.get("/create-conversation", createConversation)
router.get("/get-conversations", getConversations)
router.post("/update-conversation", updateConversations)
router.post("/save-message", saveMessage)
router.get("/get-messages/:conversationId", getAllMessages)

export default router