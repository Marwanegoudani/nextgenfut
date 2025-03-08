import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { UserModel } from '@/models/user';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { PlayerAvailability } from '@/types';

// Validation schema for player availability
const availabilitySchema = z.object({
  isAvailable: z.boolean(),
  availableUntil: z.string().datetime().optional(),
  preferredPositions: z.array(z.enum(['GK', 'DEF', 'MID', 'FWD'])).optional(),
  maxDistance: z.number().min(1).max(100).optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  lastUpdated: z.string().datetime(),
});

interface PlayerWithAvailability {
  _id: string;
  availability?: PlayerAvailability;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
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
    
    // Only allow users to access their own availability
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Get player from database
    const player = await UserModel.findOne({ _id: id, role: 'player' })
      .select('availability')
      .lean() as PlayerWithAvailability;
      
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ availability: player.availability || null });
  } catch (error) {
    console.error('Failed to get player availability:', error);
    return NextResponse.json(
      { error: 'Failed to get player availability' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
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
    
    // Only allow users to update their own availability
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = availabilitySchema.parse(body);
    
    // Update player availability
    const player = await UserModel.findOneAndUpdate(
      { _id: id, role: 'player' },
      { availability: validatedData },
      { new: true }
    )
      .select('availability')
      .lean() as PlayerWithAvailability;
    
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ availability: player.availability });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Failed to update player availability:', error);
    return NextResponse.json(
      { error: 'Failed to update player availability' },
      { status: 500 }
    );
  }
} 