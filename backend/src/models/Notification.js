import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    type: { type: String, required: true },
    channel: { type: String, default: 'email' },
    status: { type: String, default: 'pending' },
    attempts: { type: Number, default: 0 },
    lastAttemptAt: { type: Date, default: null },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
