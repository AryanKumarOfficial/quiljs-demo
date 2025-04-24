import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Response from '@/models/Response';
import mongoose from 'mongoose';
import { getCurrentUser } from '@/lib/get-session';

export async function GET() {
  try {
    // Get the current authenticated user
    const user = await getCurrentUser();
    
    // If no authenticated user, return unauthorized
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    // Filter responses by the current user's ID
    const responses = await Response.find({ userId: user.id }).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: responses },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch responses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current authenticated user
    const user = await getCurrentUser();
    
    // If no authenticated user, return unauthorized
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, tag, description, editorType } = body;
    
    // Validate required fields
    if (!title || !tag || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Include the userId in the response
    const response = await Response.create({
      title,
      tag,
      description,
      editorType,
      userId: user.id, // Associate response with current user
    });

    return NextResponse.json(
      { success: true, data: response },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create response:', error);
    
    // Handle validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create response' },
      { status: 500 }
    );
  }
}