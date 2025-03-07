import mongoose, { Schema, Document } from 'mongoose';

export interface IMatch extends Document {
  title: string;
  description?: string;
  location: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  maxPlayers: number;
  players: mongoose.Types.ObjectId[];
  status: 'upcoming' | 'ongoing' | 'completed';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    location: {
      type: String,
      required: [true, 'Please provide a location'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date'],
    },
    time: {
      type: String,
      required: [true, 'Please provide a time'],
    },
    duration: {
      type: Number,
      required: [true, 'Please provide a duration'],
      min: [30, 'Duration must be at least 30 minutes'],
      max: [180, 'Duration cannot be more than 180 minutes'],
    },
    maxPlayers: {
      type: Number,
      required: [true, 'Please provide a maximum number of players'],
      min: [2, 'At least 2 players are required'],
      max: [22, 'Maximum 22 players are allowed'],
    },
    players: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
  },
  { timestamps: true }
);

// Create a compound index for date and location
MatchSchema.index({ date: 1, location: 1 });

// Create a model
const MatchModel = mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);

export default MatchModel; 