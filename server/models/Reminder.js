import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema(
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
    cronExpression: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    channel: {
      type: String,
      enum: ['email', 'push', 'in-app'],
      default: 'email',
    },
  },
  {
    timestamps: true,
  }
);

const Reminder = mongoose.model('Reminder', reminderSchema);

export default Reminder;
