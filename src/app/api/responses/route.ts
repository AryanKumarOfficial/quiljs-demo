import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Response from '@/models/Response';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectToDatabase();
    const responses = await Response.find().sort({ createdAt: -1 });

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
    
    const response = await Response.create({
      title,
      tag,
      description,
      editorType,
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