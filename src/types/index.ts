export type Role = 'player' | 'scout' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  name: string;
  address: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface Match {
  id: string;
  date: Date;
  location: Location;
  teams: {
    home: string[]; // Array of player IDs
    away: string[]; // Array of player IDs
  };
  status: 'scheduled' | 'in-progress' | 'completed';
  scores: {
    home: number;
    away: number;
  };
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

export interface Rating {
  id: string;
  matchId: string;
  playerId: string;
  raterId: string;
  skills: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
  };
  comments: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerProfile extends User {
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  height?: number; // in cm
  weight?: number; // in kg
  strongFoot: 'left' | 'right' | 'both';
  dateOfBirth: Date;
  nationality: string;
  averageRating?: number;
  matchesPlayed: number;
}

export interface ScoutProfile extends User {
  organization: string;
  yearsOfExperience: number;
  specialization?: string[];
  playersDiscovered: number;
} 