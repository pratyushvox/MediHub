import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
      message: { type: String, required: true },
      recipient: {
        id: { type: mongoose.Schema.Types.ObjectId, required: true },
        role: { type: String, enum: ['admin', 'doctor', 'patient'], required: true }
      },
      read: { type: Boolean, default: false }
    },
    { timestamps: true }
  );
const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
