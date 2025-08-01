const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const protect = require("../middleware/auth");

// Get all chats for a user
router.get("/", protect, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id })
      .select("_id title createdAt updatedAt messages")
      .sort({ updatedAt: -1 });

    // Add message count to each chat
    const chatsWithCount = chats.map((chat) => ({
      _id: chat._id,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messageCount: chat.messages.length,
    }));

    res.json(chatsWithCount);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get a specific chat with all messages
router.get("/:chatId", protect, async (req, res) => {
  try {
    console.log("ChatId received:", req.params.chatId);
    console.log("ChatId type:", typeof req.params.chatId);
    console.log("ChatId length:", req.params.chatId.length);

    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create a new chat
router.post("/", protect, async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res
        .status(400)
        .json({ message: "Title and initial message are required" });
    }

    const newChat = new Chat({
      userId: req.user.id,
      title,
      messages: [
        {
          sender: "user",
          text: message,
          timestamp: new Date(),
        },
      ],
    });

    const savedChat = await newChat.save();
    res.status(201).json(savedChat);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add a message to an existing chat
router.post("/:chatId/messages", protect, async (req, res) => {
  try {
    const { sender, text } = req.body;

    if (!sender || !text) {
      return res.status(400).json({ message: "Sender and text are required" });
    }

    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    chat.messages.push({
      sender,
      text,
      timestamp: new Date(),
    });

    const updatedChat = await chat.save();
    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update chat title
router.put("/:chatId", protect, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.chatId, userId: req.user.id },
      { title },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a chat
router.delete("/:chatId", protect, async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.chatId,
      userId: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
