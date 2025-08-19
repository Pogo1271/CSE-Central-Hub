#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to handle errors
handle_error() {
    print_error "Setup failed at step: $1"
    print_error "Please check the error messages above and try again."
    exit 1
}

# Start setup
print_status "Starting project setup..."

# Check if Node.js is installed
if ! command_exists node; then
    handle_error "Node.js is not installed. Please install Node.js first."
fi

# Check if npm is installed
if ! command_exists npm; then
    handle_error "npm is not installed. Please install npm first."
fi

# Step 1: Install dependencies
print_status "Step 1: Installing dependencies..."
npm install || handle_error "Installing dependencies"
print_success "Dependencies installed successfully"

# Step 2: Create .env file if it doesn't exist
print_status "Step 2: Creating .env file..."
if [ ! -f .env ]; then
    echo "DATABASE_URL=file:./dev.db" > .env
    print_success ".env file created"
else
    print_warning ".env file already exists, skipping creation"
fi

# Step 3: Generate Prisma client
print_status "Step 3: Generating Prisma client..."
npx prisma generate || handle_error "Generating Prisma client"
print_success "Prisma client generated successfully"

# Step 4: Push database schema
print_status "Step 4: Setting up database..."
npx prisma db push || handle_error "Setting up database"
print_success "Database setup completed"

# Step 5: Seed database with demo users
print_status "Step 5: Creating demo users..."
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
        },
        {
          name: 'Support Person 1',
          email: 'support1@businesshub.com',
          password: hashedUserPassword,
          role: 'User',
          status: 'Active',
          color: '#10B981',
          joined: new Date()
        },
        {
          name: 'Support Person 2',
          email: 'support2@businesshub.com',
          password: hashedUserPassword,
          role: 'User',
          status: 'Active',
          color: '#8B5CF6',
          joined: new Date()
        },
        {
          name: 'Support Person 3',
          email: 'support3@businesshub.com',
          password: hashedUserPassword,
          role: 'User',
          status: 'Active',
          color: '#F97316',
          joined: new Date()
        },
        {
          name: 'Support Person 4',
          email: 'support4@businesshub.com',
          password: hashedUserPassword,
          role: 'User',
          status: 'Active',
          color: '#EC4899',
          joined: new Date()
        }
      ]
    });

    console.log('Demo users created successfully!');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('Demo users already exist, skipping...');
    } else {
      console.error('Error seeding database:', error);
      throw error;
    }
  } finally {
    await prisma.\$disconnect();
  }
}

seed();
" || handle_error "Creating demo users"
print_success "Demo users created successfully"

# Step 6: Start development server
print_status "Step 6: Starting development server..."
print_success "Setup completed successfully!"
print_status "Starting development server..."
print_status "Application will be available at: http://localhost:3000"
print_status ""
print_status "Demo Accounts:"
print_status "- Admin: admin@businesshub.com / admin123"
print_status "- Manager: manager@businesshub.com / manager123"
print_status "- Business User: user@businesshub.com / user123"
print_status "- Support Person 1: support1@businesshub.com / user123"
print_status "- Support Person 2: support2@businesshub.com / user123"
print_status "- Support Person 3: support3@businesshub.com / user123"
print_status "- Support Person 4: support4@businesshub.com / user123"
print_status ""
print_status "Press Ctrl+C to stop the server"
print_status ""

# Start the development server
npm run dev