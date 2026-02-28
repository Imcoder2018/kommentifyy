// Test script to check scheduled posts API
// Use native fetch (available in Node 18+)

async function testScheduledPosts() {
  try {
    // You'll need to replace this with a valid auth token
    const token = 'your-auth-token-here';
    
    const response = await fetch('http://localhost:3000/api/scheduled-posts', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    console.log('Scheduled Posts API Response:', data);
  } catch (error) {
    console.error('Error testing scheduled posts:', error);
  }
}

testScheduledPosts();
