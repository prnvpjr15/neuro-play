const axios = require('axios');

console.log('🔧 Creating Test User...\n');

const BASE_URL = 'http://localhost:4000/api';

async function createTestUser() {
  try {
    // Test user data
    const testUser = {
      email: 'test@example.com',
      password: 'test123',
      role: 'user'
    };

    console.log('Creating test user with:', testUser);

    const response = await axios.post(`${BASE_URL}/auth/signup`, testUser);
    
    if (response.data.message === 'Signup success') {
      console.log('✅ Test user created successfully!');
      console.log('\n📋 Test Credentials:');
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Password: ${testUser.password}`);
      console.log(`   Role: ${testUser.role}`);
      console.log('\n🚀 You can now test the login system!');
    } else {
      console.log('❌ Unexpected response:', response.data);
    }

  } catch (error) {
    if (error.response?.data?.error === 'Email taken') {
      console.log('✅ Test user already exists!');
      console.log('\n📋 Test Credentials:');
      console.log('   Email: test@example.com');
      console.log('   Password: test123');
      console.log('   Role: user');
      console.log('\n🚀 You can now test the login system!');
    } else {
      console.log('❌ Error creating test user:', error.response?.data?.error || error.message);
      console.log('\n🔧 Make sure:');
      console.log('   1. Backend server is running (npm start in autism-backend)');
      console.log('   2. MongoDB is connected');
      console.log('   3. .env file is configured correctly');
    }
  }
}

createTestUser();
