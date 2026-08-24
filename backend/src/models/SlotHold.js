import mongoose from 'mongoose';

const slotHoldSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Prevent duplicate holds on the same doctor/date/slot
slotHoldSchema.index({ doctorId: 1, date: 1, startTime: 1 }, { unique: true });
// MongoDB TTL index — automatically deletes the document once expiresAt passes
slotHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('SlotHold', slotHoldSchema);
