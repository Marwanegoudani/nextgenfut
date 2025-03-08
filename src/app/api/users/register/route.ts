import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { UserModel } from '@/models/user';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Define the request body schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['player', 'team', 'scout']).default('player'),
});

interface ValidationError {
  path: (string | number)[];
  message: string;
}

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Get request body
    const body = await req.json();

    // Validate request body
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const errors: ValidationError[] = result.error.errors.map((error) => ({
        path: error.path,
        message: error.message,
      }));
      return NextResponse.json(
        { errors },
        { status: 400 }
      );
    }

    const { name, email, password, role } = result.data;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Return success response
    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Log the error for debugging
    console.error('Registration error:', error);

    // Return error response
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 