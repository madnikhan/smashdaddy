#!/usr/bin/env node

/**
 * Setup Supabase Environment Variables
 */

const fs = require('fs');
const path = require('path');

// Supabase connection details
const SUPABASE_CONFIG = {
  host: 'db.bpqodsnljtcmgzlrariu.supabase.co',
  port: '5432',
  database: 'postgres',
  user: 'postgres',
  password: '[YOUR-PASSWORD]' // Replace with actual password
};

function generateConnectionString() {
  const { host, port, database, user, password } = SUPABASE_CONFIG;
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

function updateEnvFile() {
  const envPath = path.join(__dirname, '.env');
  const connectionString = generateConnectionString();
  
  // Read existing .env file if it exists
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Update or add DATABASE_URL
  const databaseUrlRegex = /^DATABASE_URL=.*$/m;
  const newDatabaseUrl = `DATABASE_URL="${connectionString}"`;
  
  if (databaseUrlRegex.test(envContent)) {
    envContent = envContent.replace(databaseUrlRegex, newDatabaseUrl);
  } else {
    envContent += `\n${newDatabaseUrl}\n`;
  }
  
  // Add other Supabase-related environment variables
  const additionalVars = [
    'NEXTAUTH_URL=http://localhost:3000',
    'NEXTAUTH_SECRET=your-nextauth-secret-key-here',
    'SUPABASE_URL=https://bpqodsnljtcmgzlrariu.supabase.co',
    'SUPABASE_ANON_KEY=your-supabase-anon-key-here'
  ];
  
  additionalVars.forEach(varLine => {
    const [varName] = varLine.split('=');
    const varRegex = new RegExp(`^${varName}=.*$`, 'm');
    
    if (!varRegex.test(envContent)) {
      envContent += `${varLine}\n`;
    }
  });
  
  // Write the updated .env file
  fs.writeFileSync(envPath, envContent.trim() + '\n');
  
  console.log('✅ Environment variables updated in .env file');
  console.log('\n📝 Next steps:');
  console.log('1. Replace [YOUR-PASSWORD] with your actual password');
  console.log('2. Update NEXTAUTH_SECRET with a secure random string');
  console.log('3. Get your Supabase anon key from the dashboard and update SUPABASE_ANON_KEY');
  console.log('4. Run: npm run test-connection');
}

function main() {
  console.log('🔧 Setting up Supabase environment variables...\n');
  
  if (SUPABASE_CONFIG.password === '[YOUR-PASSWORD]') {
    console.log('⚠️  WARNING: You need to replace [YOUR-PASSWORD] with your actual password!');
    console.log('Edit this script and update the password field.\n');
  }
  
  updateEnvFile();
}

main(); 