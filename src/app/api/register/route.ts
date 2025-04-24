import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create a new user
    const user = new User({
      name,
      email,
      password, // Will be hashed by the pre-save hook
    });

    // Save the user to the database
    await user.save();

    // Return the user without the password
    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email
        } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred while registering' },
      { status: 500 }
    );
  }
}