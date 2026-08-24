import mongoose from 'mongoose';

const workingHoursSchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    specialisation: { type: String, required: true },
    bio: { type: String, default: '' },
    slotDurationMinutes: { type: Number, default: 30 },
    leaveDays: { type: [String], default: [] },
    workingHours: { type: [workingHoursSchema], default: [] },
    avatarUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

doctorSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    userId: this.userId ? this.userId.toString() : '',
    name: this.name,
    email: this.email,
    specialisation: this.specialisation,
    bio: this.bio || '',
    slotDurationMinutes: this.slotDurationMinutes,
    leaveDays: this.leaveDays || [],
    workingHours: this.workingHours || [],
    avatarUrl: this.avatarUrl || undefined,
  };
};

export default mongoose.model('Doctor', doctorSchema);
