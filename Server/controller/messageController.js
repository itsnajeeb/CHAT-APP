
import cloudinary from '../lib/cloudinary.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { io, userSocketMap } from '../server.js';

// Get all users except logged-in user
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;

        const users = await User.find({
            _id: { $ne: userId }
        }).select('-password');

        const unseenMessages = {};

        await Promise.all(
            users.map(async (user) => {
                const count = await Message.countDocuments({
                    senderId: user._id,
                    receiverId: userId,
                    seen: false
                });

                if (count > 0) {
                    unseenMessages[user._id.toString()] = count;
                }
            })
        );

        return res.status(200).json({
            success: true,
            users,
            unseenMessages
        });

    } catch (error) {
        console.error(error.message);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get messages for selected user
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 });

        // Mark received messages as seen
        await Message.updateMany(
            {
                senderId: selectedUserId,
                receiverId: myId,
                seen: false
            },
            { $set: { seen: true } }
        );

        return res.status(200).json({
            success: true,
            messages
        });

    } catch (error) {
        console.error(error.message);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Mark individual message as seen
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;

        await Message.findByIdAndUpdate(id, {
            $set: { seen: true }
        });

        return res.status(200).json({
            success: true
        });

    } catch (error) {
        console.error(error.message);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Send message to selected user
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;

        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl = '';

        // Upload image if provided
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        // Save message
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text: text || '',
            image: imageUrl
        });

        // Emit message to receiver
        const receiverSocketId = userSocketMap[receiverId.toString()];

        if (receiverSocketId) {
            io.to(receiverSocketId).emit(
                'newMessage',
                newMessage
            );
        }

        return res.status(201).json({
            success: true,
            newMessage
        });

    } catch (error) {
        console.error('Send Message Error:', error.message);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
