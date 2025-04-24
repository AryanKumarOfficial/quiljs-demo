import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Response from '@/models/Response';
import mongoose from 'mongoose';
import { getCurrentUser } from '@/lib/get-session';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid response ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    // Find response that belongs to the current user
    const response = await Response.findOne({ _id: id, userId: user.id });
    
    if (!response) {
      return NextResponse.json(
        { success: false, error: 'Response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: response },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch response:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch response' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid response ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Delete only if it belongs to the current user
    const response = await Response.findOneAndDelete({ _id: id, userId: user.id });
    
    if (!response) {
      return NextResponse.json(
        { success: false, error: 'Response not found or you do not have permission' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: { message: 'Response deleted successfully' } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete response:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete response' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params;
    const body = await request.json();
    const { title, tag, description, editorType } = body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid response ID' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!title || !tag || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Update only if it belongs to the current user
    const response = await Response.findOneAndUpdate(
      { _id: id, userId: user.id },
      { title, tag, description, editorType },
      { new: true, runValidators: true }
    );
    
    if (!response) {
      return NextResponse.json(
        { success: false, error: 'Response not found or you do not have permission' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: response },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update response:', error);
    
    // Handle validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update response' },
      { status: 500 }
    );
  }
}