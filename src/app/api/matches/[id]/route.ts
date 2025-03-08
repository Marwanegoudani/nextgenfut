import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { MatchService } from '@/services/match.service';
import { authOptions } from '@/lib/auth';

// Validation schema for updating match status
const updateMatchSchema = z.object({
  status: z.enum(['scheduled', 'in-progress', 'completed']),
  scores: z
    .object({
      home: z.number().min(0),
      away: z.number().min(0),
    })
    .optional(),
});

// Validation schema for joining a match
const joinMatchSchema = z.object({
  team: z.enum(['home', 'away']),
});

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const match = await MatchService.getMatchById(id);
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error('Failed to get match:', error);
    return NextResponse.json(
      { error: 'Failed to get match' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
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
    const validatedData = updateMatchSchema.parse(body);

    // Update match
    const match = await MatchService.updateMatchStatus(
      id,
      validatedData.status,
      validatedData.scores
    );

    return NextResponse.json(match);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to update match:', error);
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await MatchService.deleteMatch(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete match:', error);
    return NextResponse.json(
      { error: 'Failed to delete match' },
      { status: 500 }
    );
  }
}

// Join match endpoint
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
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
    const validatedData = joinMatchSchema.parse(body);

    // Join match
    const match = await MatchService.joinMatch(
      id,
      session.user.id,
      validatedData.team
    );

    return NextResponse.json(match);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to join match:', error);
    return NextResponse.json(
      { error: 'Failed to join match' },
      { status: 500 }
    );
  }
} 