const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPlans() {
  try {
    console.log('🔍 Checking current plans in database...');
    
    // Get all current plans
    const currentPlans = await prisma.plan.findMany();
    console.log('Current plans:', JSON.stringify(currentPlans, null, 2));
    
    if (currentPlans.length === 0) {
      console.log('📝 No plans found, creating default plans...');
      
      // Create default plans
      const defaultPlans = [
        {
          name: 'Free',
          price: 0,
          dailyComments: 5,
          dailyLikes: 10,
          dailyShares: 2,
          dailyFollows: 5,
          aiPostsPerDay: 0,
          allowAiPostGeneration: false,
          allowAiCommentGeneration: false,
          allowPostScheduling: false,
          allowCsvExport: false
        },
        {
          name: 'Starter',
          price: 9,
          dailyComments: 25,
          dailyLikes: 50,
          dailyShares: 10,
          dailyFollows: 25,
          aiPostsPerDay: 2,
          allowAiPostGeneration: true,
          allowAiCommentGeneration: true,
          allowPostScheduling: true,
          allowCsvExport: false
        },
        {
          name: 'Pro',
          price: 29,
          dailyComments: 100,
          dailyLikes: 200,
          dailyShares: 50,
          dailyFollows: 100,
          aiPostsPerDay: 10,
          allowAiPostGeneration: true,
          allowAiCommentGeneration: true,
          allowPostScheduling: true,
          allowCsvExport: true
        }
      ];
      
      for (const planData of defaultPlans) {
        const plan = await prisma.plan.create({ data: planData });
        console.log(`✅ Created plan: ${plan.name} ($${plan.price})`);
      }
    } else {
      console.log('📝 Found existing plans, checking for issues...');
      
      // Check for plans with all limits set to 0
      const problematicPlans = currentPlans.filter(plan => 
        plan.dailyComments === 0 && 
        plan.dailyLikes === 0 && 
        plan.dailyFollows === 0 && 
        plan.aiPostsPerDay === 0
      );
      
      if (problematicPlans.length > 0) {
        console.log('🔧 Found plans with 0 limits, fixing...');
        
        for (const plan of problematicPlans) {
          let updatedData = {};
          
          if (plan.name.toLowerCase() === 'starter') {
            updatedData = {
              dailyComments: 25,
              dailyLikes: 50,
              dailyShares: 10,
              dailyFollows: 25,
              aiPostsPerDay: 2
            };
          } else if (plan.name.toLowerCase() === 'free') {
            updatedData = {
              dailyComments: 5,
              dailyLikes: 10,
              dailyShares: 2,
              dailyFollows: 5,
              aiPostsPerDay: 0
            };
          } else if (plan.name.toLowerCase() === 'pro') {
            updatedData = {
              dailyComments: 100,
              dailyLikes: 200,
              dailyShares: 50,
              dailyFollows: 100,
              aiPostsPerDay: 10
            };
          }
          
          if (Object.keys(updatedData).length > 0) {
            await prisma.plan.update({
              where: { id: plan.id },
              data: updatedData
            });
            console.log(`✅ Fixed plan: ${plan.name} with proper limits`);
          }
        }
      }
    }
    
    // Show final plans
    console.log('\n🎯 Final plans in database:');
    const finalPlans = await prisma.plan.findMany({
      orderBy: { price: 'asc' }
    });
    
    finalPlans.forEach(plan => {
      console.log(`\n📋 ${plan.name} - $${plan.price}/month`);
      console.log(`   💬 ${plan.dailyComments} Comments/day`);
      console.log(`   ❤️ ${plan.dailyLikes} Likes/day`);
      console.log(`   📤 ${plan.dailyShares} Shares/day`);
      console.log(`   👥 ${plan.dailyFollows} Follows/day`);
      console.log(`   🤖 ${plan.aiPostsPerDay} AI Posts/day`);
    });
    
    console.log('\n✅ Plans database check/fix completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPlans();
