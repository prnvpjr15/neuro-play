const axios = require('axios');
const { exec } = require('child_process');

console.log('🧪 Testing Autism Support Project...\n');

// Test configuration
const BACKEND_URL = 'http://localhost:4000';
const FRONTEND_URL = 'http://localhost:3000';

// Test functions
async function testBackend() {
  console.log('🔧 Testing Backend...');
  
  try {
    // Test basic server response
    const response = await axios.get(`${BACKEND_URL}/api/protected`);
    console.log('✅ Backend is running and responding');
    console.log(`   Response: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    console.log('❌ Backend test failed');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testFrontend() {
  console.log('\n🎨 Testing Frontend...');
  
  try {
    // Test if frontend is accessible
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
    console.log('✅ Frontend is accessible');
    console.log(`   Status: ${response.status}`);
    return true;
  } catch (error) {
    console.log('❌ Frontend test failed');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testDatabase() {
  console.log('\n🗄️  Testing Database Connection...');
  
  try {
    // Test database connection through backend
    const response = await axios.post(`${BACKEND_URL}/api/auth/signup`, {
      email: 'test@example.com',
      password: 'testpassword123',
      role: 'user'
    });
    
    if (response.data.message === 'Signup success') {
      console.log('✅ Database connection successful');
      console.log('   Test user created successfully');
      return true;
    } else {
      console.log('❌ Database test failed');
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    if (error.response?.data?.error === 'Email taken') {
      console.log('✅ Database connection successful');
      console.log('   Test user already exists (this is fine)');
      return true;
    } else {
      console.log('❌ Database test failed');
      console.log(`   Error: ${error.message}`);
      return false;
    }
  }
}

async function runTests() {
  console.log('🚀 Starting project tests...\n');
  
  const backendOk = await testBackend();
  const frontendOk = await testFrontend();
  const databaseOk = await testDatabase();
  
  console.log('\n📊 Test Results:');
  console.log(`   Backend: ${backendOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Frontend: ${frontendOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Database: ${databaseOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (backendOk && frontendOk && databaseOk) {
    console.log('\n🎉 All tests passed! Your project is working correctly.');
    console.log('\n🌐 Access your application:');
    console.log(`   Frontend: ${FRONTEND_URL}`);
    console.log(`   Backend API: ${BACKEND_URL}/api`);
    console.log('\n📖 Check SETUP.md for detailed usage instructions.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   1. Ensure MongoDB is running');
    console.log('   2. Check .env files are configured correctly');
    console.log('   3. Verify ports 3000 and 4000 are available');
    console.log('   4. Check SETUP.md for detailed setup instructions');
  }
}

// Run tests
runTests().catch(console.error);
