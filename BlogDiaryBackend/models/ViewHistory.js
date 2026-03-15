
import mongoose from 'mongoose';

const viewHistorySchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    ip: {
      type: String,
      default: null,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  
  },
  { timestamps: false } 
);


viewHistorySchema.index(
  { blog: 1, user: 1, ip: 1, viewedAt: 1 },
  {
    unique: true,
    partialFilterExpression: { viewedAt: { $exists: true } },
  }
);

export default mongoose.model('ViewHistory', viewHistorySchema);