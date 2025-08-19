import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quote = await db.quote.findUnique({
      where: { id: params.id },
      include: {
        business: true,
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    })
    
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }
    
    // Generate simple HTML content for PDF
    const htmlContent = generateQuoteHTML(quote)
    
    // Return HTML that can be converted to PDF
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="quote-${quote.id.slice(-6)}.html"`
      }
    })
  } catch (error) {
    console.error('Error generating quote:', error)
    return NextResponse.json({ error: 'Failed to generate quote' }, { status: 500 })
  }
}

function generateQuoteHTML(quote: any) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Quote #${quote.id.slice(-6)}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin: 0;
        }
        .subtitle {
            color: #666;
            margin: 5px 0;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            background: #f5f5f5;
            padding: 10px;
            margin-bottom: 15px;
            border-left: 4px solid #3B82F6;
        }
        .row {
            display: flex;
            margin-bottom: 8px;
        }
        .label {
            font-weight: bold;
            width: 120px;
            color: #555;
        }
        .value {
            flex: 1;
            color: #333;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .table th,
        .table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        .table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #333;
        }
        .table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .total {
            text-align: right;
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-top: 15px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status.draft {
            background-color: #fff3cd;
            color: #856404;
        }
        .status.sent {
            background-color: #d1ecf1;
            color: #0c5460;
        }
        .status.accepted {
            background-color: #d4edda;
            color: #155724;
        }
        .status.rejected {
            background-color: #f8d7da;
            color: #721c24;
        }
        @media print {
            body {
                background: white;
            }
            .container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">Quote</h1>
            <div class="subtitle">Quote #${quote.id.slice(-6)}</div>
            <div class="subtitle">Date: ${formatDate(quote.createdAt)}</div>
            <div class="subtitle">
                Status: <span class="status ${quote.status}">${quote.status}</span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Business Information</div>
            <div class="row">
                <div class="label">Name:</div>
                <div class="value">${quote.business.name}</div>
            </div>
            ${quote.business.description ? `
            <div class="row">
                <div class="label">Description:</div>
                <div class="value">${quote.business.description}</div>
            </div>
            ` : ''}
            ${quote.business.location ? `
            <div class="row">
                <div class="label">Location:</div>
                <div class="value">${quote.business.location}</div>
            </div>
            ` : ''}
            ${quote.business.email ? `
            <div class="row">
                <div class="label">Email:</div>
                <div class="value">${quote.business.email}</div>
            </div>
            ` : ''}
            ${quote.business.phone ? `
            <div class="row">
                <div class="label">Phone:</div>
                <div class="value">${quote.business.phone}</div>
            </div>
            ` : ''}
        </div>

        <div class="section">
            <div class="section-title">Quote Details</div>
            <div class="row">
                <div class="label">Title:</div>
                <div class="value">${quote.title}</div>
            </div>
            ${quote.description ? `
            <div class="row">
                <div class="label">Description:</div>
                <div class="value">${quote.description}</div>
            </div>
            ` : ''}
            <div class="row">
                <div class="label">Created By:</div>
                <div class="value">${quote.user?.name || 'Unknown'}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Quote Items</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${quote.items.map((item: any) => `
                    <tr>
                        <td>${item.product.name}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.price)}</td>
                        <td>${formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="total">
                Total Amount: ${formatCurrency(quote.totalAmount)}
            </div>
        </div>

        <div class="footer">
            <p>This quote was generated automatically from the Business Management System.</p>
            <p>For questions or concerns, please contact your account manager.</p>
        </div>
    </div>
</body>
</html>
  `
}