import mongoose from 'mongoose';

const doseLogSchema = new mongoose.Schema(
  {
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Medication',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    takenAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Taken', 'Missed', 'Snoozed', 'Pending'],
      default: 'Pending',
    },
    note: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const DoseLog = mongoose.model('DoseLog', doseLogSchema);

export default DoseLog;
