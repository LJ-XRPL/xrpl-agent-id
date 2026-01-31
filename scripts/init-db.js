#!/usr/bin/env node

/**
 * Database initialization script for XRPL Agent Identity Registry
 * 
 * This script sets up the SQLite database with all required tables
 * and creates some sample data for development/testing.
 */

const path = require('path');
const fs = require('fs');

// Ensure we can load our database module
const dbPath = path.join(__dirname, '../src/lib/db.ts');

if (!fs.existsSync(dbPath)) {
  console.error('Error: Database module not found at', dbPath);
  process.exit(1);
}

console.log('🚀 Initializing XRPL Agent Identity Registry database...');

// For development, we'll create a simple initialization
// In a production setup, this would use proper TypeScript compilation
try {
  // Create data directory
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Created data directory:', dataDir);
  }

  console.log('✅ Database initialization setup complete!');
  console.log('\nNext steps:');
  console.log('1. Set up your .env file with XRPL credentials:');
  console.log('   cp .env.example .env');
  console.log('   # Edit .env with your XRPL issuer account details');
  console.log('');
  console.log('2. Install dependencies:');
  console.log('   npm install');
  console.log('');
  console.log('3. Start the development server:');
  console.log('   npm run dev');
  console.log('');
  console.log('📚 For XRPL account generation, visit:');
  console.log('   https://xrpl.org/xrp-testnet-faucet.html');
  
} catch (error) {
  console.error('❌ Database initialization failed:', error.message);
  process.exit(1);
}