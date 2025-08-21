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

    // Check if we're in the correct directory (look for package.json)
    if (!fs.existsSync(path.join(process.cwd(), 'package.json'))) {
        logError('package.json not found. Please run this script from the project root directory.');
        process.exit(1);
    }

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

    // Step 5: Seed database with comprehensive demo data
    logInfo('Step 5: Creating comprehensive demo data...');
    try {
        // First run the basic seed to ensure roles and users are created
        runCommand('npx tsx seed.js', 'Running basic seed script...', { continueOnError: true });
        
        // Then run the comprehensive demo data for additional sample data
        runCommand('npx tsx prisma/comprehensive-demo-data.ts', 'Running comprehensive demo data script...', { continueOnError: true });
        
        logSuccess('Demo data creation completed!');
    } catch (error) {
        logWarning('Demo data seeding had some issues, but continuing with setup...');
        // Continue even if demo data fails, as the basic seed should have worked
    }

    // Step 6: Verify installation and provide helpful information
    logInfo('Step 6: Verifying installation...');
    
    // Check if critical directories exist
    const criticalDirs = ['src', 'prisma', 'public'];
    for (const dir of criticalDirs) {
        if (!fs.existsSync(path.join(process.cwd(), dir))) {
            logError(`Critical directory missing: ${dir}`);
            process.exit(1);
        }
    }
    
    // Check if package.json has all required scripts
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    const requiredScripts = ['dev', 'build', 'start', 'lint', 'db:push', 'db:generate'];
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
    
    if (missingScripts.length > 0) {
        logWarning(`Missing npm scripts: ${missingScripts.join(', ')}`);
    }
    
    logSuccess('Installation verified successfully!');

    // Setup completed
    logSuccess('Setup completed successfully!');
    logInfo('Starting development server...');
    logInfo('Application will be available at: http://localhost:3000');
    log('');
    log('Demo Accounts:', 'cyan');
    log('- Admin: admin@businesshub.com / admin123', 'cyan');
    log('- Features: Full system access including user management and analytics', 'cyan');
    log('- Manager: manager@businesshub.com / manager123', 'cyan');
    log('- Features: Business management, tasks, quotes, documents (limited admin access)', 'cyan');
    log('- User: user@businesshub.com / user123', 'cyan');
    log('- Features: Dashboard and tasks only (basic access)', 'cyan');
    log('');
    log('Sidebar Navigation Fix:', 'cyan');
    log('- Page access permissions now control sidebar visibility correctly', 'cyan');
    log('- Admin users see all navigation items', 'cyan');
    log('- Manager users see relevant navigation items based on permissions', 'cyan');
    log('- User users see only Dashboard and Tasks navigation items', 'cyan');
    log('');
    log('Demo Businesses:', 'cyan');
    log('- Cornwall Scales (Technology) - Active with Support Contract', 'cyan');
    log('  - Contact: John Smith (Managing Director)', 'cyan');
    log('- Marketing Pro (Marketing) - Active', 'cyan');
    log('  - Contact: Sarah Johnson (Marketing Director)', 'cyan');
    log('- Tech Solutions Inc. (Technology) - Active with 2 Tasks, 1 Quote', 'cyan');
    log('  - Contact: Michael Chen (CTO)', 'cyan');
    log('- Retail Store Plus (Retail) - Active with Support Contract', 'cyan');
    log('  - Contact: Emily Davis (Store Manager)', 'cyan');
    log('- Restaurant Biz (Restaurant) - Active', 'cyan');
    log('  - Contact: Carlos Rodriguez (Head Chef)', 'cyan');
    log('');
    log('Demo Products:', 'cyan');
    log('- EPOS System Pro - Hardware ($2,999.99 one-off)', 'cyan');
    log('- Support Package - Services ($299.99 monthly)', 'cyan');
    log('- Inventory Management System - Software ($1,499.99 one-off)', 'cyan');
    log('- Website Package - Services ($2,499.99 one-off)', 'cyan');
    log('');
    log('Features Available:', 'cyan');
    log('- ✅ Complete Business Directory with support contract status indicators', 'cyan');
    log('- ✅ Role-based access control (Admin, Manager, User)', 'cyan');
    log('- ✅ Drag and drop task management with calendar view', 'cyan');
    log('- ✅ Recurring tasks with custom intervals and patterns', 'cyan');
    log('- ✅ Individual editing of recurring task instances', 'cyan');
    log('- ✅ Inventory management with low stock alerts', 'cyan');
    log('- ✅ Quote generation and management system', 'cyan');
    log('- ✅ Document management with file upload', 'cyan');
    log('- ✅ Real-time messaging and notifications', 'cyan');
    log('- ✅ Analytics dashboard with charts and reports', 'cyan');
    log('- ✅ Support contract management with visual indicators', 'cyan');
    log('- ✅ Custom notification system (replaced browser alerts)', 'cyan');
    log('- ✅ Responsive design for all screen sizes', 'cyan');
    log('- ✅ Real-time updates via Socket.IO', 'cyan');
    log('- ✅ Sidebar navigation with role-based visibility controls', 'cyan');
    log('');
    log('Press Ctrl+C to stop the server', 'yellow');
    log('');
    log('Useful Commands:', 'cyan');
    log('- npm run lint: Check code quality', 'cyan');
    log('- npm run db:push: Update database schema', 'cyan');
    log('- npm run build: Build for production', 'cyan');
    log('- npm run start: Start production server', 'cyan');
    log('');
    log('Project Structure:', 'cyan');
    log('- src/app/: Next.js app router pages', 'cyan');
    log('- src/components/: Reusable UI components', 'cyan');
    log('- src/lib/: Utilities and API clients', 'cyan');
    log('- prisma/: Database schema and migrations', 'cyan');
    log('- public/: Static assets', 'cyan');
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