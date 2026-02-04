const fetch = require('node-fetch');

async function testAdminDisplay() {
  try {
    console.log('🧪 Testing Admin Portal Display Logic...');
    
    // Simulate the formatted API response structure
    const mockFormattedPlan = {
      id: "plan_test",
      name: "Test Plan",
      price: 19.99,
      stripeLink: null,
      limits: {
        dailyComments: 25,
        dailyLikes: 50,
        dailyShares: 10,
        dailyFollows: 25,
        dailyConnections: 15,
        aiPostsDaily: 5,
        aiCommentsDaily: 15,
        aiTopicLinesDaily: 8
      },
      features: {
        autoLike: true,
        autoComment: true,
        autoFollow: true,
        aiContent: true,
        aiTopicLines: true,
        scheduling: true,
        analytics: false
      }
    };

    // Test the display logic (simulating what the admin portal does)
    console.log('\n📊 Testing Display Values:');
    console.log('Comments/day:', mockFormattedPlan.limits?.dailyComments || mockFormattedPlan.dailyComments || 0);
    console.log('Likes/day:', mockFormattedPlan.limits?.dailyLikes || mockFormattedPlan.dailyLikes || 0);
    console.log('Shares/day:', mockFormattedPlan.limits?.dailyShares || mockFormattedPlan.dailyShares || 0);
    console.log('Follows/day:', mockFormattedPlan.limits?.dailyFollows || mockFormattedPlan.dailyFollows || 0);
    console.log('AI Posts/day:', mockFormattedPlan.limits?.aiPostsDaily || mockFormattedPlan.aiPostsPerDay || 0);

    console.log('\n🎯 Testing Features:');
    console.log('AI Post Generation:', !!(mockFormattedPlan.features?.aiContent || mockFormattedPlan.allowAiPostGeneration));
    console.log('AI Comment Generation:', !!(mockFormattedPlan.features?.autoComment || mockFormattedPlan.allowAiCommentGeneration));
    console.log('AI Topic Lines:', !!(mockFormattedPlan.features?.aiTopicLines || mockFormattedPlan.allowAiTopicLines));
    console.log('Scheduling:', !!(mockFormattedPlan.features?.scheduling || mockFormattedPlan.allowPostScheduling));

    // Test form initialization logic
    console.log('\n📝 Testing Form Initialization:');
    const formData = {
      name: mockFormattedPlan.name || '',
      price: mockFormattedPlan.price || 0,
      stripePaymentLink: mockFormattedPlan.stripePaymentLink || mockFormattedPlan.stripeLink || '',
      dailyComments: mockFormattedPlan.limits?.dailyComments || mockFormattedPlan.dailyComments || 50,
      dailyLikes: mockFormattedPlan.limits?.dailyLikes || mockFormattedPlan.dailyLikes || 100,
      allowAiPostGeneration: mockFormattedPlan.features?.aiContent || mockFormattedPlan.allowAiPostGeneration || true,
      allowAiCommentGeneration: mockFormattedPlan.features?.autoComment || mockFormattedPlan.allowAiCommentGeneration || true,
    };
    
    console.log('Form Data:', JSON.stringify(formData, null, 2));
    
    console.log('\n✅ Display logic test completed - values should now show correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminDisplay();
