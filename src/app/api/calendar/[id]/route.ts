import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/calendar/[id] - Get a single calendar event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await db.calendarEvent.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Calendar event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar event' },
      { status: 500 }
    );
  }
}

// PUT /api/calendar/[id] - Update a calendar event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, description, startTime, endTime, userId, status } = body;

    const existingEvent = await db.calendarEvent.findUnique({
      where: { id: params.id },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Calendar event not found' },
        { status: 404 }
      );
    }

    // Validate user if provided
    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }

    // Validate date times if provided
    let startDateTime, endDateTime;
    if (startTime) {
      startDateTime = new Date(startTime);
      if (isNaN(startDateTime.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format for start time' },
          { status: 400 }
        );
      }
    }

    if (endTime) {
      endDateTime = new Date(endTime);
      if (isNaN(endDateTime.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format for end time' },
          { status: 400 }
        );
      }
    }

    // Check time validation if both times are provided
    if (startDateTime && endDateTime && startDateTime >= endDateTime) {
      return NextResponse.json(
        { error: 'Start time must be before end time' },
        { status: 400 }
      );
    }

    const updateData: any = {
      title,
      description,
      userId,
      status,
    };

    if (startDateTime) updateData.startTime = startDateTime;
    if (endDateTime) updateData.endTime = endDateTime;

    const event = await db.calendarEvent.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar/[id] - Delete a calendar event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingEvent = await db.calendarEvent.findUnique({
      where: { id: params.id },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Calendar event not found' },
        { status: 404 }
      );
    }

    await db.calendarEvent.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Calendar event deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    );
  }
}