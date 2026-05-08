import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    dosage: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    frequency: {
      type: String, // e.g., 'Daily', 'Weekly', 'As Needed'
      required: true,
    },
    schedule: [
      {
        time: { type: String, required: true }, // 'HH:mm'
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    category: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Medication = mongoose.model('Medication', medicationSchema);

export default Medication;
