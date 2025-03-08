import mongoose, { Schema, Document } from 'mongoose';
import { hash, compare } from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'player' | 'team' | 'scout';
  profilePicture?: string;
  bio?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Player specific fields
export interface IPlayer extends IUser {
  position?: string;
  skills?: string[];
  age?: number;
  height?: number;
  weight?: number;
  dominantFoot?: 'left' | 'right' | 'both';
  averageRating?: number;
  matchesPlayed?: number;
  availability?: {
    isAvailable: boolean;
    availableUntil?: Date;
    preferredPositions?: string[];
    maxDistance?: number;
    location?: {
      latitude: number;
      longitude: number;
    };
    lastUpdated: Date;
  };
}

// Team specific fields
export interface ITeam extends IUser {
  players?: mongoose.Types.ObjectId[];
  matches?: mongoose.Types.ObjectId[];
  foundedAt?: Date;
}

// Scout specific fields
export interface IScout extends IUser {
  organization?: string;
  playersTracked?: mongoose.Types.ObjectId[];
}

// Define the discriminator key
const DISCRIMINATOR_KEY = 'role';

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    // The role field is handled by the discriminator
    // We don't need to define it explicitly here
    profilePicture: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
    },
    location: {
      type: String,
    },
  },
  { timestamps: true, discriminatorKey: DISCRIMINATOR_KEY }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await compare(candidatePassword, this.password);
};

// Player Schema
const PlayerSchema = new Schema<IPlayer>({
  position: String,
  skills: [String],
  age: Number,
  height: Number,
  weight: Number,
  dominantFoot: {
    type: String,
    enum: ['left', 'right', 'both'],
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  matchesPlayed: {
    type: Number,
    default: 0,
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: false,
    },
    availableUntil: Date,
    preferredPositions: [String],
    maxDistance: Number,
    location: {
      latitude: Number,
      longitude: Number,
    },
    lastUpdated: Date,
  },
});

// Team Schema
const TeamSchema = new Schema<ITeam>({
  players: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  matches: [{
    type: Schema.Types.ObjectId,
    ref: 'Match',
  }],
  foundedAt: Date,
});

// Scout Schema
const ScoutSchema = new Schema<IScout>({
  organization: String,
  playersTracked: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
});

// Create models
const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// Only create these models if they don't exist
const PlayerModel = UserModel.discriminators?.Player || 
  UserModel.discriminator<IPlayer>('Player', PlayerSchema);

const TeamModel = UserModel.discriminators?.Team || 
  UserModel.discriminator<ITeam>('Team', TeamSchema);

const ScoutModel = UserModel.discriminators?.Scout || 
  UserModel.discriminator<IScout>('Scout', ScoutSchema);

export { UserModel, PlayerModel, TeamModel, ScoutModel }; 