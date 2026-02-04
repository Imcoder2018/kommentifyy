/**
 * Setup test user for testing topic generation
 */

const API_URL = 'http://localhost:3001';

async function createTestUser() {
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123',
        confirmPassword: 'testpassword123'
    };

    try {
        console.log('🔧 Creating test user...');
        
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log('✅ Test user created successfully!');
            console.log('📧 Email:', testUser.email);
            console.log('🔑 Password:', testUser.password);
            return true;
        } else {
            console.log('ℹ️ User might already exist:', data.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Error creating test user:', error);
        return false;
    }
}

async function loginTestUser() {
    const credentials = {
        email: 'test@example.com',
        password: 'testpassword123'
    };

    try {
        console.log('🔑 Logging in test user...');
        
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log('✅ Login successful!');
            console.log('🎫 Token:', data.token?.substring(0, 50) + '...');
            console.log('👤 User:', data.user?.name);
            return data;
        } else {
            console.log('❌ Login failed:', data.error);
            return null;
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        return null;
    }
}

async function testTopicGeneration(authToken) {
    try {
        console.log('🎯 Testing topic generation...');
        
        const response = await fetch(`${API_URL}/api/ai/generate-topics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                topic: 'python programming',
                count: 5
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log('✅ Topic generation successful!');
            console.log('📝 Generated topics:');
            data.topics.forEach((topic, index) => {
                console.log(`   ${index + 1}. ${topic}`);
            });
            return true;
        } else {
            console.log('❌ Topic generation failed:', data.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Topic generation error:', error);
        return false;
    }
}

async function setupAndTest() {
    console.log('🚀 Setting up test environment...\n');
    
    // Step 1: Create test user (or confirm it exists)
    await createTestUser();
    
    console.log('\n' + '─'.repeat(50) + '\n');
    
    // Step 2: Login
    const loginData = await loginTestUser();
    if (!loginData) {
        console.log('❌ Cannot proceed without valid login');
        return;
    }
    
    console.log('\n' + '─'.repeat(50) + '\n');
    
    // Step 3: Test topic generation
    const topicResult = await testTopicGeneration(loginData.token);
    
    console.log('\n' + '─'.repeat(50) + '\n');
    
    if (topicResult) {
        console.log('🎉 All tests passed! Topic generation is working.');
        console.log('\n📋 Extension Setup Instructions:');
        console.log('1. Open the extension popup');
        console.log('2. Login with:');
        console.log('   📧 Email: test@example.com');
        console.log('   🔑 Password: testpassword123');
        console.log('3. Try generating topic lines');
    } else {
        console.log('🚨 Topic generation test failed. Check backend logs.');
    }
}

// Auto-run if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    setupAndTest();
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.setupAndTest = setupAndTest;
    window.createTestUser = createTestUser;
    window.loginTestUser = loginTestUser;
    window.testTopicGeneration = testTopicGeneration;
}
