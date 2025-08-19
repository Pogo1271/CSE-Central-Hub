import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/calendar - Get all calendar events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.AND = [
        {
          startTime: {
            gte: new Date(startDate),
          },
        },
        {
          endTime: {
            lte: new Date(endDate),
          },
        },
      ];
    }

    const [events, total] = await Promise.all([
      db.calendarEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.calendarEvent.count({ where }),
    ]);

    return NextResponse.json({
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

// POST /api/calendar - Create a new calendar event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, startTime, endTime, userId, status } = body;

    // Validate required fields
    if (!title || !startTime || !endTime || !userId) {
      return NextResponse.json(
        { error: 'Title, start time, end time, and user ID are required' },
        { status: 400 }
      );
    }

    // Validate date times
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format for start or end time' },
        { status: 400 }
      );
    }

    if (startDateTime >= endDateTime) {
      return NextResponse.json(
        { error: 'Start time must be before end time' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const event = await db.calendarEvent.create({
      data: {
        title,
        description,
        startTime: startDateTime,
        endTime: endDateTime,
        userId,
        status: status || 'scheduled',
      },
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

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}