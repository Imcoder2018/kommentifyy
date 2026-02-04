const fetch = require('node-fetch');

const BASE_URL = 'https://kommentify.com'; // Production URL
// const BASE_URL = 'http://localhost:3000'; // Local URL

async function testAdminFlow() {
    try {
        console.log('1. Logging in as Admin...');
        const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'adminpassword123'
            })
        });

        const loginData = await loginRes.json();
        console.log('Login Response:', loginData);

        if (!loginData.success || !loginData.token) {
            throw new Error('Login failed');
        }

        const token = loginData.token;
        console.log('✅ Admin Token received');

        console.log('2. Fetching Users...');
        const usersRes = await fetch(`${BASE_URL}/api/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const usersData = await usersRes.json();
        console.log('Users Response:', JSON.stringify(usersData, null, 2));

        if (usersData.users && usersData.users.length > 0) {
            console.log(`✅ Successfully fetched ${usersData.users.length} users`);
        } else {
            console.warn('⚠️ Fetched 0 users (or failed)');
        }

        console.log('3. Fetching Plans...');
        const plansRes = await fetch(`${BASE_URL}/api/admin/plans`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const plansData = await plansRes.json();
        console.log('Admin Plans Response:', JSON.stringify(plansData, null, 2));
        
        // Also test the public plans API to compare
        console.log('\n3b. Testing Public Plans API...');
        const publicPlansRes = await fetch(`${BASE_URL}/api/plans`);
        const publicPlansData = await publicPlansRes.json();
        console.log('Public Plans Response:', JSON.stringify(publicPlansData, null, 2));

        if (plansData.success && plansData.plans) {
            console.log(`✅ Successfully fetched ${plansData.plans.length} plans`);
            
            // Test creating a new plan
            console.log('\n4. Testing Plan Creation...');
            const newPlan = {
                name: 'Test Plan ' + Date.now(),
                price: 19.99,
                stripePaymentLink: 'https://buy.stripe.com/test_plan',
                dailyComments: 30,
                dailyLikes: 60,
                dailyShares: 15,
                dailyFollows: 30,
                dailyConnections: 20,
                aiPostsPerDay: 5,
                aiCommentsPerDay: 30,
                aiTopicLinesPerDay: 15,
                allowAiPostGeneration: true,
                allowAiCommentGeneration: true,
                allowAiTopicLines: true,
                allowPostScheduling: true,
                allowAutomation: true,
                allowAutomationScheduling: false,
                allowNetworking: true,
                allowNetworkScheduling: false,
                allowCsvExport: true
            };

            const createRes = await fetch(`${BASE_URL}/api/admin/plans`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newPlan)
            });

            const createData = await createRes.json();
            console.log('Create Plan Response:', JSON.stringify(createData, null, 2));

            if (createData.success && createData.plan) {
                console.log('✅ Plan created successfully');
                const createdPlanId = createData.plan.id;

                // Test updating the plan
                console.log('\n5. Testing Plan Update...');
                const updatedPlan = {
                    ...newPlan,
                    name: 'Updated Test Plan ' + Date.now(),
                    price: 24.99,
                    dailyComments: 40,
                    allowAutomationScheduling: true
                };

                const updateRes = await fetch(`${BASE_URL}/api/admin/plans/${createdPlanId}`, {
                    method: 'PUT',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedPlan)
                });

                const updateData = await updateRes.json();
                console.log('Update Plan Response:', JSON.stringify(updateData, null, 2));

                if (updateData.success) {
                    console.log('✅ Plan updated successfully');
                } else {
                    console.error('❌ Plan update failed:', updateData.error);
                }

                // Test deleting the plan
                console.log('\n6. Testing Plan Deletion...');
                const deleteRes = await fetch(`${BASE_URL}/api/admin/plans/${createdPlanId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const deleteData = await deleteRes.json();
                console.log('Delete Plan Response:', JSON.stringify(deleteData, null, 2));

                if (deleteData.success) {
                    console.log('✅ Plan deleted successfully');
                } else {
                    console.error('❌ Plan deletion failed:', deleteData.error);
                }
            } else {
                console.error('❌ Plan creation failed:', createData.error);
            }
        } else {
            console.error('❌ Failed to fetch plans:', plansData.error);
        }

        console.log('\n🎯 Test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testAdminFlow();
