import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { UserModel, PlayerModel, TeamModel, ScoutModel } from '@/models/user';
import { z } from 'zod';

// Define validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['player', 'team', 'scout']),
});

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Parse and validate request body
    const body = await req.json();
    console.log('Registration request body:', { ...body, password: '***' });
    
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validation.data;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user based on role
    let user;
    // Create the base user data without the role field
    // When using discriminators, the role is determined by which model we use
    const userData = {
      name,
      email,
      password,
      // Don't include role here as it's handled by the discriminator
    };

    console.log('Creating user with data:', { ...userData, password: '***', role });

    try {
      switch (role) {
        case 'player':
          user = new PlayerModel(userData);
          await user.save();
          break;
        case 'team':
          user = new TeamModel(userData);
          await user.save();
          break;
        case 'scout':
          user = new ScoutModel(userData);
          await user.save();
          break;
        default:
          return NextResponse.json(
            { message: 'Invalid role' },
            { status: 400 }
          );
      }
    } catch (saveError: any) {
      console.error('Error saving user:', saveError);
      return NextResponse.json(
        { message: `Error creating user: ${saveError.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Return success response (exclude password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return NextResponse.json(
      { message: 'User registered successfully', user: userResponse },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 