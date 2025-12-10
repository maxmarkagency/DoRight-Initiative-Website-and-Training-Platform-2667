// Test script to verify the DoRight LMS API
import fetch from 'node-fetch';

const API_URL = 'http://localhost:4000';

async function testAPI() {
    console.log('🧪 Testing DoRight LMS API...\n');
    
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    try {
        const healthResponse = await fetch(`${API_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health:', JSON.stringify(healthData, null, 2));
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
    }
    
    // Test 2: User Registration
    console.log('\n2. Testing user registration...');
    try {
        const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'testuser@example.com',
                password: 'TestPass123!',
                first_name: 'Test',
                last_name: 'User'
            })
        });
        const registerData = await registerResponse.json();
        console.log('Register response:', JSON.stringify(registerData, null, 2));
    } catch (error) {
        console.log('Register error:', error.message);
    }
    
    // Test 3: Login with existing user
    console.log('\n3. Testing login...');
    try {
        const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'student@doright.ng',
                password: 'StudentPassword123'  // Without special character for now
            })
        });
        const loginData = await loginResponse.json();
        console.log('Login response:', JSON.stringify(loginData, null, 2));
    } catch (error) {
        console.log('Login error:', error.message);
    }
}

testAPI().catch(console.error);