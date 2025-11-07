import Message from "../models/message.js";

export const sendMessage = async(req, res) => {
    try {
        const {receiver, content} = req.body;
        const message = await Message.create({
            sender: req.user.id,
            receiver,
            content,
        });
        res.status(201).json(message);
    } 
    catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const getMessages = async (req, res) => {
    try {
      const messages = await Message.find({
        $or: [
          { sender: req.user.id, receiver: req.params.id },
          { sender: req.params.id, receiver: req.user.id },
        ],
      }).sort({ createdAt: 1 });
  
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
