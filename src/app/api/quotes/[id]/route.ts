import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/quotes/[id] - Get a single quote
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quote = await db.quote.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        quoteItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}

// PUT /api/quotes/[id] - Update a quote
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, description, companyId, userId, status, quoteItems } = body;

    const existingQuote = await db.quote.findUnique({
      where: { id: params.id },
    });

    if (!existingQuote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Validate company and user if provided
    if (companyId) {
      const company = await db.company.findUnique({
        where: { id: companyId },
      });
      if (!company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
    }

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

    // Update quote and quote items in a transaction
    const updatedQuote = await db.$transaction(async (prisma) => {
      // Update quote
      const quote = await prisma.quote.update({
        where: { id: params.id },
        data: {
          title,
          description,
          companyId,
          userId,
          status,
        },
      });

      // Update quote items if provided
      if (quoteItems) {
        // Delete existing quote items
        await prisma.quoteItem.deleteMany({
          where: { quoteId: params.id },
        });

        // Create new quote items
        if (quoteItems.length > 0) {
          await prisma.quoteItem.createMany({
            data: quoteItems.map((item: any) => ({
              quoteId: params.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price || 0,
            })),
          });
        }
      }

      return quote;
    });

    // Fetch the complete updated quote
    const completeQuote = await db.quote.findUnique({
      where: { id: updatedQuote.id },
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

    return NextResponse.json(completeQuote);
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    );
  }
}

// DELETE /api/quotes/[id] - Delete a quote
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingQuote = await db.quote.findUnique({
      where: { id: params.id },
    });

    if (!existingQuote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Delete quote and its items in a transaction
    await db.$transaction(async (prisma) => {
      // Delete quote items first
      await prisma.quoteItem.deleteMany({
        where: { quoteId: params.id },
      });

      // Delete quote
      await prisma.quote.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({ message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json(
      { error: 'Failed to delete quote' },
      { status: 500 }
    );
  }
}