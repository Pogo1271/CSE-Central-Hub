import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/companies/[id] - Get a single company
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const company = await db.company.findUnique({
      where: { id: params.id },
      include: {
        quotes: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

// PUT /api/companies/[id] - Update a company
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, email, phone, address, city, state, postalCode, country } = body;

    const existingCompany = await db.company.findUnique({
      where: { id: params.id },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const company = await db.company.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone,
        address,
        city,
        state,
        postalCode,
        country,
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[id] - Delete a company
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingCompany = await db.company.findUnique({
      where: { id: params.id },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    await db.company.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}