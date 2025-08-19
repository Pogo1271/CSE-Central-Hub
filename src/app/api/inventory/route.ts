import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/inventory - Get all inventory items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const productId = searchParams.get('productId');
    const lowStock = searchParams.get('lowStock') === 'true';

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (productId) {
      where.productId = productId;
    }

    if (lowStock) {
      where.quantity = { lt: 10 }; // Assuming low stock is less than 10 items
    }

    const [inventory, total] = await Promise.all([
      db.inventory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      db.inventory.count({ where }),
    ]);

    return NextResponse.json({
      inventory,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

// POST /api/inventory - Create or update inventory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity } = body;

    // Validate required fields
    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }

    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { error: 'Quantity must be a non-negative number' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if inventory record exists for this product
    const existingInventory = await db.inventory.findUnique({
      where: { productId },
    });

    let inventory;
    if (existingInventory) {
      // Update existing inventory
      inventory = await db.inventory.update({
        where: { productId },
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
    } else {
      // Create new inventory record
      inventory = await db.inventory.create({
        data: {
          productId,
          quantity,
        },
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
    }

    return NextResponse.json(inventory, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating inventory:', error);
    return NextResponse.json(
      { error: 'Failed to create/update inventory' },
      { status: 500 }
    );
  }
}