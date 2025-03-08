import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { MatchService } from '@/services/match.service';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';

// Validation schema for creating a match
const createMatchSchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  location: z.object({
    name: z.string().min(1, 'Location name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
  }),
});

// Validation schema for query parameters
const querySchema = z.object({
  status: z.enum(['scheduled', 'in-progress', 'completed']).optional(),
  city: z.string().optional(),
  startDate: z.string()
    .transform((str) => new Date(str))
    .optional(),
  endDate: z.string()
    .transform((str) => new Date(str))
    .optional(),
  limit: z.string()
    .transform((str) => parseInt(str, 10))
    .optional(),
  skip: z.string()
    .transform((str) => parseInt(str, 10))
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    // Ensure database connection is established
    await dbConnect();

    // Parse query parameters
    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const validatedQuery = querySchema.parse(searchParams);

    // Prepare filters
    const filters: any = {
      status: validatedQuery.status,
      city: validatedQuery.city,
      limit: validatedQuery.limit || 10,
      skip: validatedQuery.skip || 0,
    };

    if (validatedQuery.startDate && validatedQuery.endDate) {
      filters.date = {
        start: validatedQuery.startDate,
        end: validatedQuery.endDate,
      };
    }

    // Get matches
    const { matches, total } = await MatchService.getMatches(filters);

    return NextResponse.json({
      matches,
      total,
      page: Math.floor(filters.skip / filters.limit) + 1,
      totalPages: Math.ceil(total / filters.limit),
    });
  } catch (error) {
    console.error('Error in GET /api/matches:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    // Check for specific database timeout errors
    if (error instanceof Error && error.message.includes('buffering timed out')) {
      return NextResponse.json(
        { error: 'Database operation timed out. Please try again.' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get matches' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Ensure database connection is established
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createMatchSchema.parse(body);

    const match = await MatchService.createMatch(
      validatedData.date,
      validatedData.location,
      session.user.id
    );

    return NextResponse.json(match);
  } catch (error) {
    console.error('Error in POST /api/matches:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    // Check for specific database timeout errors
    if (error instanceof Error && error.message.includes('buffering timed out')) {
      return NextResponse.json(
        { error: 'Database operation timed out. Please try again.' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    );
  }
} 