import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/quotes - Get all quotes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const companyId = searchParams.get('companyId');
    const userId = searchParams.get('userId');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (userId) {
      where.userId = userId;
    }

    const [quotes, total] = await Promise.all([
      db.quote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          quoteItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      }),
      db.quote.count({ where }),
    ]);

    return NextResponse.json({
      quotes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

// POST /api/quotes - Create a new quote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, companyId, userId, quoteItems } = body;

    // Validate required fields
    if (!title || !companyId || !userId) {
      return NextResponse.json(
        { error: 'Title, company ID, and user ID are required' },
        { status: 400 }
      );
    }

    // Check if company and user exist
    const [company, user] = await Promise.all([
      db.company.findUnique({ where: { id: companyId } }),
      db.user.findUnique({ where: { id: userId } }),
    ]);

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create quote with quote items in a transaction
    const quote = await db.$transaction(async (prisma) => {
      const createdQuote = await prisma.quote.create({
        data: {
          title,
          description,
          companyId,
          userId,
          status: 'draft',
        },
      });

      if (quoteItems && quoteItems.length > 0) {
        await prisma.quoteItem.createMany({
          data: quoteItems.map((item: any) => ({
            quoteId: createdQuote.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price || 0,
          })),
        });
      }

      return createdQuote;
    });

    // Fetch the complete quote with relations
    const completeQuote = await db.quote.findUnique({
      where: { id: quote.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quoteItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(completeQuote, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}