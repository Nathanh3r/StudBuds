// controllers/messageController.js
import Message from "../models/Message.js";
import User from "../models/User.js";

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { receiver, content } = req.body;

    if (!receiver || !content) {
      return res
        .status(400)
        .json({ message: "Receiver and content are required" });
    }

    // Verify receiver exists
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const message = await Message.create({
      sender: req.user.id,
      receiver,
      content,
    });

    // Populate sender info for response
    await message.populate("sender", "name email major");

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages between current user and another user
export const getMessages = async (req, res) => {
  try {
    const otherUserId = req.params.id;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user.id },
      ],
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "name email major")
      .populate("receiver", "name email major");

    res.status(200).json({ messages, count: messages.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all conversations (list of people you've messaged with)
export const getConversations = async (req, res) => {
  try {
    // Get all unique users the current user has messaged with
    const sentMessages = await Message.find({ sender: req.user.id }).distinct(
      "receiver"
    );
    const receivedMessages = await Message.find({
      receiver: req.user.id,
    }).distinct("sender");

    // Combine and get unique user IDs
    const conversationUserIds = [
      ...new Set([...sentMessages, ...receivedMessages]),
    ];

    // Get user details and last message for each conversation
    const conversations = await Promise.all(
      conversationUserIds.map(async (userId) => {
        // Get user info
        const user = await User.findById(userId).select("name email major bio");

        // Get last message in conversation
        const lastMessage = await Message.findOne({
          $or: [
            { sender: req.user.id, receiver: userId },
            { sender: userId, receiver: req.user.id },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(1);

        // Count unread messages from this user
        const unreadCount = await Message.countDocuments({
          sender: userId,
          receiver: req.user.id,
          read: false,
        });

        return {
          user,
          lastMessage,
          unreadCount,
        };
      })
    );

    // Sort by last message timestamp
    conversations.sort((a, b) => {
      const dateA = a.lastMessage?.createdAt || 0;
      const dateB = b.lastMessage?.createdAt || 0;
      return dateB - dateA;
    });

    res.status(200).json({ conversations, count: conversations.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const senderId = req.params.id;

    const result = await Message.updateMany(
      {
        sender: senderId,
        receiver: req.user.id,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.id,
      read: false,
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a message (only sender can delete)
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can delete their own message
    if (message.sender.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this message" });
    }

    await message.deleteOne();

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
