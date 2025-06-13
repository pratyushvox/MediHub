import mongoose from 'mongoose';

// Message subdocument schema
const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'messages.senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['Doctor', 'User']
  },
  content: { type: String, trim: true },
  attachment: { type: String },
  status: { type: String, enum: ['sent','read'], default: 'sent' },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

// Participant subdocument schema
const ParticipantSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'participants.model'
  },
  model: { type: String, required: true, enum: ['Doctor','User'] }
}, { _id: false });

// Chat model embedding participants + messages
const ChatSchema = new mongoose.Schema({
  participants: { type: [ParticipantSchema], validate: v => v.length === 2 },
  messages: { type: [MessageSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Chat', ChatSchema);

