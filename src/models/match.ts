import mongoose, { Schema } from 'mongoose';
import { Match } from '@/types';

const locationSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
});

const matchSchema = new Schema<Match>(
  {
    id: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
    date: { type: Date, required: true },
    location: { type: locationSchema, required: true },
    teams: {
      home: [{ type: String, ref: 'User' }],
      away: [{ type: String, ref: 'User' }],
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed'],
      default: 'scheduled',
    },
    scores: {
      home: { type: Number, default: 0 },
      away: { type: Number, default: 0 },
    },
    createdBy: { type: String, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toObject: {
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for better query performance
matchSchema.index({ date: 1 });
matchSchema.index({ status: 1 });
matchSchema.index({ 'location.city': 1 });
matchSchema.index({ createdBy: 1 });

// Virtual populate for ratings
matchSchema.virtual('ratings', {
  ref: 'Rating',
  localField: '_id',
  foreignField: 'matchId',
});

const MatchModel = mongoose.models.Match || mongoose.model<Match>('Match', matchSchema);

export default MatchModel; 