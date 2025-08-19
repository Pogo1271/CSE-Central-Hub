@echo off
echo Starting project setup...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Step 1: Install dependencies
echo [INFO] Step 1: Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Installing dependencies failed.
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully

REM Step 2: Create .env file if it doesn't exist
echo [INFO] Step 2: Creating .env file...
if not exist .env (
    echo DATABASE_URL=file:./dev.db > .env
    echo [SUCCESS] .env file created
) else (
    echo [WARNING] .env file already exists, skipping creation
)

REM Step 3: Generate Prisma client
echo [INFO] Step 3: Generating Prisma client...
npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Generating Prisma client failed.
    pause
    exit /b 1
)
echo [SUCCESS] Prisma client generated successfully

REM Step 4: Push database schema
echo [INFO] Step 4: Setting up database...
npx prisma db push
if %errorlevel% neq 0 (
    echo [ERROR] Setting up database failed.
    pause
    exit /b 1
)
echo [SUCCESS] Database setup completed

REM Step 5: Seed database with demo users
echo [INFO] Step 5: Creating demo users...
node -e "const { PrismaClient } = require('@prisma/client'); const bcrypt = require('bcryptjs'); const prisma = new PrismaClient(); async function seed() { try { const hashedAdminPassword = await bcrypt.hash('admin123', 12); const hashedManagerPassword = await bcrypt.hash('manager123', 12); const hashedUserPassword = await bcrypt.hash('user123', 12); await prisma.user.createMany({ data: [ { name: 'Admin User', email: 'admin@businesshub.com', password: hashedAdminPassword, role: 'Admin', status: 'Active', color: '#EF4444', joined: new Date() }, { name: 'Manager User', email: 'manager@businesshub.com', password: hashedManagerPassword, role: 'Manager', status: 'Active', color: '#F59E0B', joined: new Date() }, { name: 'Business User', email: 'user@businesshub.com', password: hashedUserPassword, role: 'User', status: 'Active', color: '#3B82F6', joined: new Date() } ] }); console.log('Demo users created successfully!'); } catch (error) { if (error.code === 'P2002') { console.log('Demo users already exist, skipping...'); } else { console.error('Error seeding database:', error); throw error; } } finally { await prisma.$disconnect(); } } seed();"
if %errorlevel% neq 0 (
    echo [ERROR] Creating demo users failed.
    pause
    exit /b 1
)
echo [SUCCESS] Demo users created successfully

REM Step 6: Start development server
echo [INFO] Step 6: Starting development server...
echo [SUCCESS] Setup completed successfully!
echo [INFO] Starting development server...
echo [INFO] Application will be available at: http://localhost:3000
echo.
echo Demo Accounts:
echo - Admin: admin@businesshub.com / admin123
echo - Manager: manager@businesshub.com / manager123
echo - User: user@businesshub.com / user123
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the development server
npm run dev