# Database Setup Instructions for Windows

## 1. Create .env file
Create a `.env` file in your project root with the following content:

```
DATABASE_URL=file:./dev.db
```

## 2. Install dependencies and generate Prisma client
Run these commands in order:

```bash
npm install
npx prisma generate
npx prisma db push
```

## 3. (Optional) Seed the database with demo users
After setting up the database, you can create demo users by running:

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  try {
    const hashedAdminPassword = await bcrypt.hash('admin123', 12);
    const hashedManagerPassword = await bcrypt.hash('manager123', 12);
    const hashedUserPassword = await bcrypt.hash('user123', 12);

    await prisma.user.createMany({
      data: [
        {
          name: 'Admin User',
          email: 'admin@businesshub.com',
          password: hashedAdminPassword,
          role: 'Admin',
          status: 'Active',
          color: '#EF4444',
          joined: new Date()
        },
        {
          name: 'Manager User',
          email: 'manager@businesshub.com',
          password: hashedManagerPassword,
          role: 'Manager',
          status: 'Active',
          color: '#F59E0B',
          joined: new Date()
        },
        {
          name: 'Business User',
          email: 'user@businesshub.com',
          password: hashedUserPassword,
          role: 'User',
          status: 'Active',
          color: '#3B82F6',
          joined: new Date()
        }
      ]
    });

    console.log('Demo users created successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.\$disconnect();
  }
}

seed();
"
```

## 4. Start the development server
```bash
npm run dev
```

## Demo Accounts
Once seeded, you can use these accounts:

- **Admin**: admin@businesshub.com / admin123
- **Manager**: manager@businesshub.com / manager123  
- **User**: user@businesshub.com / user123

## Troubleshooting

If you get "Unexpected token '<'" errors, it means the API routes are returning HTML instead of JSON. This usually happens when:

1. Prisma client is not generated (run `npx prisma generate`)
2. Database is not set up (run `npx prisma db push`)
3. DATABASE_URL is missing (check your .env file)

The error "@prisma/client did not initialize yet" means you need to run `npx prisma generate` to generate the Prisma client.