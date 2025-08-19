#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Color codes for output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logInfo(message) {
    log(`[INFO] ${message}`, 'blue');
}

function logSuccess(message) {
    log(`[SUCCESS] ${message}`, 'green');
}

function logWarning(message) {
    log(`[WARNING] ${message}`, 'yellow');
}

function logError(message) {
    log(`[ERROR] ${message}`, 'red');
}

function runCommand(command, description, options = {}) {
    try {
        logInfo(description);
        execSync(command, { stdio: 'inherit', ...options });
        logSuccess(`${description} completed`);
        return true;
    } catch (error) {
        logError(`${description} failed`);
        if (options.continueOnError) {
            logWarning('Continuing with next step...');
            return false;
        }
        logError('Setup failed. Please check the error messages above.');
        process.exit(1);
    }
}

async function main() {
    log('Starting project setup...', 'cyan');

    // Check if Node.js is installed
    try {
        execSync('node --version', { stdio: 'pipe' });
    } catch (error) {
        logError('Node.js is not installed. Please install Node.js first.');
        process.exit(1);
    }

    // Check if npm is installed
    try {
        execSync('npm --version', { stdio: 'pipe' });
    } catch (error) {
        logError('npm is not installed. Please install npm first.');
        process.exit(1);
    }

    // Step 1: Install dependencies
    runCommand('npm install', 'Step 1: Installing dependencies...');

    // Step 2: Create .env file if it doesn't exist
    logInfo('Step 2: Creating .env file...');
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, 'DATABASE_URL=file:./dev.db');
        logSuccess('.env file created');
    } else {
        logWarning('.env file already exists, skipping creation');
    }

    // Step 3: Generate Prisma client
    runCommand('npx prisma generate', 'Step 3: Generating Prisma client...');

    // Step 4: Push database schema
    runCommand('npx prisma db push', 'Step 4: Setting up database...');

    // Step 5: Seed database with demo users
    logInfo('Step 5: Creating demo users...');
    try {
        const seedScript = `
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
                    if (error.code === 'P2002') {
                        console.log('Demo users already exist, skipping...');
                    } else {
                        console.error('Error seeding database:', error);
                        throw error;
                    }
                } finally {
                    await prisma.$disconnect();
                }
            }
            
            seed();
        `;
        
        execSync(`node -e "${seedScript.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
        logSuccess('Demo users created successfully');
    } catch (error) {
        logError('Creating demo users failed');
        process.exit(1);
    }

    // Setup completed
    logSuccess('Setup completed successfully!');
    logInfo('Starting development server...');
    logInfo('Application will be available at: http://localhost:3000');
    log('');
    log('Demo Accounts:', 'cyan');
    log('- Admin: admin@businesshub.com / admin123', 'cyan');
    log('- Manager: manager@businesshub.com / manager123', 'cyan');
    log('- User: user@businesshub.com / user123', 'cyan');
    log('');
    log('Features Available:', 'cyan');
    log('- ✅ Drag and drop tasks between dates', 'cyan');
    log('- ✅ Recurring tasks with custom intervals', 'cyan');
    log('- ✅ Individual editing of recurring task instances', 'cyan');
    log('- ✅ User role-based permissions', 'cyan');
    log('- ✅ Business directory and task management', 'cyan');
    log('');
    log('Press Ctrl+C to stop the server', 'yellow');
    log('');

    // Start the development server
    try {
        require('child_process').spawn('npm', ['run', 'dev'], {
            stdio: 'inherit',
            shell: true
        });
    } catch (error) {
        logError('Failed to start development server');
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    logError(`Uncaught Exception: ${error.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    process.exit(1);
});

// Run the setup
main();