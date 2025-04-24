import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Response from '@/models/Response';
import mongoose from 'mongoose';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid response ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const response = await Response.findById(id);
    
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
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid response ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const response = await Response.findByIdAndDelete(id);
    
    if (!response) {
      return NextResponse.json(
        { success: false, error: 'Response not found' },
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
    
    const response = await Response.findByIdAndUpdate(
      id,
      { title, tag, description, editorType },
      { new: true, runValidators: true }
    );
    
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