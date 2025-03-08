import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import MatchModel from '@/models/match';
import { UserModel } from '@/models/user';

// Validation schema for invite request
const inviteSchema = z.object({
  playerId: z.string(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: matchId } = await context.params;
  
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
    
    // Parse and validate request body
    const body = await request.json();
    const { playerId } = inviteSchema.parse(body);
    
    // Check if match exists
    const match = await MatchModel.findById(matchId);
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the match creator
    if (match.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the match creator can invite players' },
        { status: 403 }
      );
    }
    
    // Check if match is scheduled
    if (match.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Can only invite players to scheduled matches' },
        { status: 400 }
      );
    }
    
    // Check if player exists
    const player = await UserModel.findById(playerId);
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }
    
    // Check if player is already in the match
    const isInHome = match.teams.home.includes(playerId);
    const isInAway = match.teams.away.includes(playerId);
    
    if (isInHome || isInAway) {
      return NextResponse.json(
        { error: 'Player is already in the match' },
        { status: 400 }
      );
    }
    
    // TODO: In a real app, we would send a notification to the player
    // For now, we'll just add them to the match directly
    
    // Add player to the team with fewer players
    if (match.teams.home.length <= match.teams.away.length) {
      match.teams.home.push(playerId);
    } else {
      match.teams.away.push(playerId);
    }
    
    await match.save();
    
    return NextResponse.json({
      message: 'Player invited successfully',
      match: {
        id: match._id,
        teams: match.teams,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Failed to invite player:', error);
    return NextResponse.json(
      { error: 'Failed to invite player' },
      { status: 500 }
    );
  }
} 