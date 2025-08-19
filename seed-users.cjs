const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    console.log('Seeding database with demo users...');
    
    // Hash passwords for demo users
    const hashedAdminPassword = await bcrypt.hash('admin123', 12);
    const hashedManagerPassword = await bcrypt.hash('manager123', 12);
    const hashedUserPassword = await bcrypt.hash('user123', 12);

    // Clear existing users
    await prisma.user.deleteMany();
    console.log('Cleared existing users');

    // Create demo users
    const users = await prisma.user.createMany({
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

    console.log('Database seeded successfully with demo users:');
    console.log('1. Admin User - admin@businesshub.com / admin123');
    console.log('2. Manager User - manager@businesshub.com / manager123');
    console.log('3. Business User - user@businesshub.com / user123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();