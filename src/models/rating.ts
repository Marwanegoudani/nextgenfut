import mongoose, { Schema } from 'mongoose';
import { Rating } from '@/types';

const skillsSchema = new Schema({
  pace: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  shooting: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  passing: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  dribbling: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  defending: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  physical: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
});

const ratingSchema = new Schema<Rating>(
  {
    id: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
    matchId: {
      type: String,
      ref: 'Match',
      required: true,
    },
    playerId: {
      type: String,
      ref: 'User',
      required: true,
    },
    raterId: {
      type: String,
      ref: 'User',
      required: true,
    },
    skills: {
      type: skillsSchema,
      required: true,
    },
    comments: {
      type: String,
      maxlength: 500,
    },
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
ratingSchema.index({ matchId: 1 });
ratingSchema.index({ playerId: 1 });
ratingSchema.index({ raterId: 1 });

// Compound index for unique ratings per match/player/rater combination
ratingSchema.index(
  { matchId: 1, playerId: 1, raterId: 1 },
  { unique: true }
);

// Virtual for average rating
ratingSchema.virtual('averageRating').get(function() {
  if (!this.skills) return '0.0';
  const values = [
    this.skills.pace,
    this.skills.shooting,
    this.skills.passing,
    this.skills.dribbling,
    this.skills.defending,
    this.skills.physical,
  ];
  const sum = values.reduce((a, b) => a + b, 0);
  return (sum / 6).toFixed(1);
});

const RatingModel = mongoose.models.Rating || mongoose.model<Rating>('Rating', ratingSchema);

export default RatingModel; 