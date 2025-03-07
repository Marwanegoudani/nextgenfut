import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  matchId: mongoose.Types.ObjectId;
  ratedBy: mongoose.Types.ObjectId;
  ratedPlayer: mongoose.Types.ObjectId;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    matchId: {
      type: Schema.Types.ObjectId,
      ref: 'Match',
      required: [true, 'Please provide a match'],
    },
    ratedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user who rated'],
    },
    ratedPlayer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a player who was rated'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot be more than 500 characters'],
    },
  },
  { timestamps: true }
);

// Create a compound index to ensure a user can only rate a player once per match
RatingSchema.index({ matchId: 1, ratedBy: 1, ratedPlayer: 1 }, { unique: true });

// Create a model
const RatingModel = mongoose.models.Rating || mongoose.model<IRating>('Rating', RatingSchema);

export default RatingModel; 