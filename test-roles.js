#!/usr/bin/env node

// Test script to verify role loading and permissions
const http = require('http');

// Test the roles endpoint
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/roles',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  console.log(`Roles API Status: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const roles = JSON.parse(data);
      console.log('Roles loaded successfully:', roles.length, 'roles found');
      console.log('Role names:', roles.map(r => r.name));
      
      // Check if Admin role exists and has proper permissions
      const adminRole = roles.find(r => r.name === 'Admin');
      if (adminRole) {
        console.log('Admin role found with permissions:', Object.keys(adminRole.permissions).length, 'permissions');
        console.log('Admin can view dashboard:', adminRole.permissions.canViewDashboardPage);
        console.log('Admin can view businesses:', adminRole.permissions.canViewBusinessesPage);
        console.log('Admin can view users:', adminRole.permissions.canViewUsersPage);
      } else {
        console.log('Admin role not found!');
      }
    } catch (error) {
      console.error('Error parsing roles response:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('Error testing roles API:', error.message);
});

req.end();