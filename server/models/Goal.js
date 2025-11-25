// server/models/Goal.js
import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      // target amount you’re locking
      type: Number,
      required: true,
      min: 0.01
    },
    lockUntil: {
      // store the date string from the input
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['locked', 'withdrawn'],
      default: 'locked'
    },
    emergencyAllowed: {
      type: Boolean,
      default: true
    },
    emergencyUsed: {
      type: Boolean,
      default: false
    },
    withdrawCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model('Goal', GoalSchema);
