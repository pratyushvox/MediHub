import Chat from '../../models/Chat/Chatmodel.js';
import { getIO } from '../../Utils/IO.js';
import User from '../../models/Usermodel/userModel.js';
import Doctor from '../../models/Doctor/Doctorsignupmodel.js';

// Helper: Get role from model (User → patient, Doctor → doctor)
const getRoleFromModel = (model) => 
  model === 'User' ? 'patient' : model.toLowerCase();

// Helper: Safely populate participant details
const populateParticipant = async (participant) => {
  try {
    if (!participant || !participant.model || !participant.item) {
      return { details: null };
    }

    // Handle both Mongoose documents and plain objects
    const participantObj = participant.toObject ? participant.toObject() : participant;
    
    const model = participantObj.model === 'User' ? User : Doctor;
    const user = await model.findById(participantObj.item)
      .select('name profilePic patientId doctorId specialist')
      .lean();

    return {
      ...participantObj,
      details: user || null
    };
  } catch (err) {
    console.error('Error populating participant:', err);
    return {
      ...(participant?.toObject?.() || participant || {}),
      details: null
    };
  }
};

// Create or fetch a chat
export const createChat = async (req, res) => {
  const { participants } = req.body;
  
  try {
    // Validate exactly 2 participants
    if (!participants || participants.length !== 2) {
      return res.status(400).json({ error: 'Chat requires exactly 2 participants' });
    }

    // Verify participants exist
    for (const p of participants) {
      const Model = p.model === 'User' ? User : Doctor;
      const exists = await Model.exists({ _id: p.item });
      if (!exists) {
        return res.status(404).json({ error: `${p.model} not found` });
      }
    }

    const ids = participants.map(p => p.item);
    let chat = await Chat.findOne({ 'participants.item': { $all: ids } });

    if (!chat) {
      chat = await Chat.create({ participants });
      console.log(`✅ Created new chat between ${ids.join(' and ')}`);
    }

    // Populate participant details
    const populatedParticipants = await Promise.all(
      chat.participants.map(populateParticipant)
    );

    res.status(200).json({
      ...chat.toObject(),
      participants: populatedParticipants
    });
  } catch (err) {
    console.error('❌ Chat creation error:', err);
    res.status(500).json({ error: 'Unable to create/fetch chat' });
  }
};

// List all chats for a user/doctor
export const getChats = async (req, res) => {
  const recipientId = req.params.recipientId;
  
  try {
    const chats = await Chat.find({ 'participants.item': recipientId })
      .sort({ updatedAt: -1 })
      .lean();

    // Enhance chat data with participant details
    const enhancedChats = await Promise.all(
      chats.map(async (chat) => {
        const otherParticipant = chat.participants.find(
          p => p.item.toString() !== recipientId
        );
        
        if (!otherParticipant) {
          return {
            ...chat,
            otherParticipant: null,
            lastMessage: null,
            unreadCount: 0
          };
        }

        const populated = await populateParticipant(otherParticipant);
        const lastMessage = chat.messages?.[chat.messages.length - 1] || null;

        return {
          ...chat,
          otherParticipant: populated.details,
          lastMessage,
          unreadCount: chat.messages?.filter(
            m => m.sender.toString() !== recipientId && m.status === 'sent'
          ).length || 0
        };
      })
    );

    res.status(200).json(enhancedChats);
  } catch (err) {
    console.error('❌ Fetch chats error:', err);
    res.status(500).json({ error: 'Unable to fetch chats' });
  }
};

// Get messages with proper participant info
export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  const { userId } = req.query; // ID of the user fetching messages
  
  try {
    const chat = await Chat.findById(chatId)
      .populate('messages.sender', 'name profilePic patientId doctorId')
      .lean();

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Mark messages as read if recipient is fetching
    if (userId) {
      await Chat.updateOne(
        { _id: chatId },
        { 
          $set: { 
            'messages.$[elem].status': 'read' 
          } 
        },
        {
          arrayFilters: [
            { 
              'elem.sender': { $ne: userId },
              'elem.status': 'sent' 
            }
          ]
        }
      );
    }

    // Add participant details
    const participants = await Promise.all(
      chat.participants.map(populateParticipant)
    );

    res.status(200).json({
      messages: chat.messages || [],
      participants
    });
  } catch (err) {
    console.error('❌ Fetch messages error:', err);
    res.status(500).json({ error: 'Unable to fetch messages' });
  }
};

// Send message with enhanced delivery
// Send message with enhanced delivery
export const sendMessage = async (req, res) => {
    const { chatId, sender, senderModel, content, attachment } = req.body;
    
    try {
      // Validate input
      if (!chatId || !sender || !senderModel || !content?.trim()) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      // Verify sender exists
      const Model = senderModel === 'User' ? User : Doctor;
      const senderExists = await Model.exists({ _id: sender });
      if (!senderExists) {
        return res.status(404).json({ error: 'Sender not found' });
      }
  
      // Check for duplicate messages (same content within last 5 seconds)
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }
  
      const now = new Date();
      const fiveSecondsAgo = new Date(now.getTime() - 5000);
      
      const duplicateMessage = chat.messages.find(msg => 
        msg.content === content.trim() && 
        msg.sender.toString() === sender && 
        new Date(msg.createdAt) > fiveSecondsAgo
      );
  
      if (duplicateMessage) {
        return res.status(200).json(duplicateMessage);
      }
  
      const message = { 
        sender, 
        senderModel, 
        content: content.trim(), 
        attachment,
        status: 'sent',
        createdAt: now
      };
  
      // Save to DB
      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { 
          $push: { messages: message }, 
          $set: { updatedAt: now } 
        },
        { new: true }
      ).populate('messages.sender', 'name profilePic patientId doctorId');
  
      const latestMessage = updatedChat.messages[updatedChat.messages.length - 1];
      const io = getIO();
  
      // Add a unique message identifier
      const messagePayload = {
        ...latestMessage.toObject(),
        _id: latestMessage._id.toString(), // Ensure _id is string
        chatId: chat._id.toString(),
        senderDetails: {
          name: latestMessage.sender.name,
          profilePic: latestMessage.sender.profilePic,
          id: latestMessage.sender._id.toString(),
          identifier: latestMessage.sender.patientId || latestMessage.sender.doctorId
        }
      };
  
      // Emit to both participants with proper room names
      for (const participant of updatedChat.participants) {
        const role = getRoleFromModel(participant.model);
        const room = `${role}:${participant.item}`;
        
        console.log(`📤 Emitting to ${room}`);
        io.to(room).emit('newMessage', messagePayload);
      }
  
      res.status(201).json(latestMessage);
    } catch (err) {
      console.error('❌ Send message error:', err);
      res.status(500).json({ error: 'Unable to send message' });
    }
  };
// Additional utility controller
export const getChatParticipant = async (req, res) => {
  const { chatId, userId } = req.params;
  
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const otherParticipant = chat.participants.find(
      p => p.item.toString() !== userId
    );

    if (!otherParticipant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    const populated = await populateParticipant(otherParticipant);
    res.status(200).json(populated.details);
  } catch (err) {
    console.error('❌ Get participant error:', err);
    res.status(500).json({ error: 'Unable to fetch participant' });
  }
};