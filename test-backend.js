const axios = require('axios');

console.log('🧪 Testing Backend API Endpoints...\n');

const BASE_URL = 'http://localhost:4000/api';

async function testBackend() {
  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connection...');
    const healthCheck = await axios.get(`${BASE_URL}/protected`);
    console.log('✅ Server is running');
    console.log(`   Response: ${JSON.stringify(healthCheck.data)}\n`);

    // Test 2: Test authentication (this should fail without token)
    console.log('2️⃣ Testing authentication...');
    try {
      await axios.get(`${BASE_URL}/dashboard/user-data`);
      console.log('❌ Authentication bypassed (this should not happen)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Authentication working correctly');
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }
    console.log('');

    // Test 3: Test signup endpoint
    console.log('3️⃣ Testing signup endpoint...');
    try {
      const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, {
        email: 'test@example.com',
        password: 'testpassword123',
        role: 'user'
      });
      console.log('✅ Signup endpoint working');
      console.log(`   Response: ${JSON.stringify(signupResponse.data)}`);
    } catch (error) {
      if (error.response?.data?.error === 'Email taken') {
        console.log('✅ Signup endpoint working (user already exists)');
      } else {
        console.log(`❌ Signup error: ${error.response?.data?.error || error.message}`);
      }
    }
    console.log('');

    console.log('🎉 Backend API test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Start the frontend: cd autism-dashboard && npm start');
    console.log('   2. Create an account and test the real-time dashboards');
    console.log('   3. Play games to see data being saved in real-time');

  } catch (error) {
    console.log('❌ Backend test failed');
    console.log(`   Error: ${error.message}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure MongoDB is running');
    console.log('   2. Check that the backend server is started');
    console.log('   3. Verify .env file is configured correctly');
  }
}

testBackend();
