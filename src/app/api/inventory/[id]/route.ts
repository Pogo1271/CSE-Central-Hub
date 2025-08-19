import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/inventory/[id] - Get a single inventory item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inventory = await db.inventory.findUnique({
      where: { id: params.id },
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
    });

    if (!inventory) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory item' },
      { status: 500 }
    );
  }
}

// PUT /api/inventory/[id] - Update inventory quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { quantity } = body;

    const existingInventory = await db.inventory.findUnique({
      where: { id: params.id },
    });

    if (!existingInventory) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    if (quantity === undefined || typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { error: 'Quantity must be a non-negative number' },
        { status: 400 }
      );
    }

    const inventory = await db.inventory.update({
      where: { id: params.id },
      data: { quantity },
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
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    );
  }
}

// DELETE /api/inventory/[id] - Delete inventory item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingInventory = await db.inventory.findUnique({
      where: { id: params.id },
    });

    if (!existingInventory) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    await db.inventory.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}