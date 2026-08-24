import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
  {
    medicineName: String,
    dosage: String,
    frequencyPerDay: Number,
    durationDays: Number,
    instructions: String,
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientName: { type: String, required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    doctorName: { type: String, required: true },
    doctorSpecialisation: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['held', 'confirmed', 'completed', 'cancelled', 'no-show'],
      default: 'confirmed',
    },
    symptomForm: {
      text: String,
      duration: String,
      severity: String,
      submittedAt: String,
    },
    preVisitSummary: {
      urgencyLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
      chiefComplaint: String,
      suggestedQuestions: [String],
      generatedAt: String,
      llmStatus: { type: String, enum: ['pending', 'success', 'failed', 'unavailable'] },
      rawSymptoms: String,
    },
    postVisitNotes: {
      clinicalNotes: String,
      prescription: [prescriptionSchema],
      submittedAt: String,
    },
    postVisitSummary: {
      patientFriendlyText: String,
      medicationSchedule: [String],
      followUpSteps: [String],
      generatedAt: String,
      llmStatus: { type: String, enum: ['pending', 'success', 'failed', 'unavailable'] },
    },
  },
  { timestamps: true }
);

appointmentSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    patientId: this.patientId.toString(),
    patientName: this.patientName,
    doctorId: this.doctorId.toString(),
    doctorName: this.doctorName,
    doctorSpecialisation: this.doctorSpecialisation,
    date: this.date,
    startTime: this.startTime,
    endTime: this.endTime,
    status: this.status,
    symptomForm: this.symptomForm || undefined,
    preVisitSummary: this.preVisitSummary || undefined,
    postVisitNotes: this.postVisitNotes || undefined,
    postVisitSummary: this.postVisitSummary || undefined,
    createdAt: this.createdAt ? this.createdAt.toISOString() : undefined,
  };
};

export default mongoose.model('Appointment', appointmentSchema);
