#!/usr/bin/env node

/**
 * Test Supabase Connection
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env file to get the actual DATABASE_URL
function getDatabaseUrl() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found. Please run the setup script first.');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/DATABASE_URL="([^"]+)"/);
  
  if (!match) {
    console.log('❌ DATABASE_URL not found in .env file.');
    process.exit(1);
  }
  
  return match[1];
}

// Test different connection string formats
function getConnectionStrings() {
  const baseUrl = getDatabaseUrl();
  
  return [
    // Original format
    baseUrl,
    
    // With SSL mode
    baseUrl + '?sslmode=require',
    
    // With additional SSL parameters
    baseUrl + '?sslmode=require&ssl=true'
  ];
}

async function testConnection(connectionString, name) {
  console.log(`\n🔍 Testing ${name}...`);
  console.log(`Connection: ${connectionString.replace(/:[^:@]*@/, ':****@')}`);
  
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    await client.connect();
    console.log('✅ Connection successful!');
    
    const result = await client.query('SELECT NOW()');
    console.log(`📅 Server time: ${result.rows[0].now}`);
    
    // Test if we can query the database
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log(`📊 Found ${tablesResult.rows.length} tables in database`);
    
    await client.end();
    return true;
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    await client.end();
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing Supabase Connection...\n');
  
  const connectionStrings = getConnectionStrings();
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const success = await testConnection(connectionStrings[i], `Format ${i + 1}`);
    if (success) {
      console.log('\n🎉 Found working connection!');
      console.log('Your database is ready for use.');
      return;
    }
  }
  
  console.log('\n❌ All connection attempts failed.');
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check your Supabase project is active');
  console.log('2. Verify the password is correct in .env file');
  console.log('3. Check IP restrictions in Supabase dashboard');
  console.log('4. Try using the connection pooling URL instead');
  console.log('5. Visit your Supabase dashboard to verify project status');
}

runTests().catch(console.error); 