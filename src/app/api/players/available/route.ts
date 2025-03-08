import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserModel } from '@/models/user';
import dbConnect from '@/lib/db';
import { z } from 'zod';

// Validation schema for query parameters
const querySchema = z.object({
  latitude: z.string().transform(val => parseFloat(val)),
  longitude: z.string().transform(val => parseFloat(val)),
  distance: z.string().transform(val => parseInt(val)).default('10'),
  position: z.string().optional(),
});

interface PlayerWithAvailability {
  _id: { toString(): string };
  name: string;
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

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    try {
      const { latitude, longitude, distance, position } = querySchema.parse(queryParams);
      
      // Calculate the date threshold for availability (players must be available now)
      const now = new Date();
      
      // Build the query
      const query: any = {
        role: 'player',
        'availability.isAvailable': true,
        'availability.availableUntil': { $gt: now },
      };
      
      // Add position filter if provided
      if (position) {
        query['availability.preferredPositions'] = position;
      }
      
      // Find available players
      const players = await UserModel.find(query)
        .select('name availability')
        .lean();
      
      // Filter players by distance
      const availablePlayers = players
        .filter((player: any) => {
          // Skip players without location
          if (!player.availability?.location) return false;
          
          // Calculate distance using Haversine formula
          const playerLat = player.availability.location.latitude;
          const playerLng = player.availability.location.longitude;
          
          const dist = calculateDistance(
            latitude,
            longitude,
            playerLat,
            playerLng
          );
          
          // Check if player is within the specified distance
          return dist <= distance && player._id.toString() !== session.user.id;
        })
        .map((player: any) => ({
          id: player._id.toString(),
          name: player.name,
          position: player.availability?.preferredPositions || [],
          maxDistance: player.availability?.maxDistance || 10,
          availableUntil: player.availability?.availableUntil,
        }));
      
      return NextResponse.json({ players: availablePlayers });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid query parameters', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Failed to get available players:', error);
    return NextResponse.json(
      { error: 'Failed to get available players' },
      { status: 500 }
    );
  }
}

// Calculate distance between two coordinates in kilometers (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
} 