/**
 * Kommentify Extension - Dummy Analytics Data Populator
 * 
 * HOW TO USE:
 * 1. Open the Kommentify extension popup in Chrome
 * 2. Right-click on the extension popup and select "Inspect"
 * 3. Go to the "Console" tab in DevTools
 * 4. Copy and paste this entire script and press Enter
 * 5. Refresh the extension popup to see the dummy data
 * 
 * This script populates high-usage dummy values in all analytics tables and stats
 * for demonstration purposes.
 */

(async function populateDummyAnalytics() {
    console.log('🚀 Starting Kommentify Dummy Analytics Population...');

    // Generate dates for the last 30 days
    const generateDates = (days) => {
        const dates = [];
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    };

    const last30Days = generateDates(30);

    // Generate random number in range
    const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Sample data
    const sampleKeywords = [
        'SaaS Growth', 'Digital Marketing', 'Startup Founder', 'Tech CEO', 
        'AI Innovation', 'Product Management', 'B2B Sales', 'Content Marketing',
        'Leadership', 'Entrepreneurship', 'Remote Work', 'Cloud Computing',
        'Machine Learning', 'Data Science', 'Growth Hacking', 'Personal Branding'
    ];

    const sampleAuthors = [
        'Alex Thompson', 'Sarah Chen', 'Michael Roberts', 'Emily Watson',
        'David Kim', 'Jessica Martinez', 'Chris Anderson', 'Amanda Foster',
        'Ryan Mitchell', 'Nicole Baker', 'James Wilson', 'Lauren Davis',
        'Mark Johnson', 'Rachel Taylor', 'Kevin Brown', 'Olivia White'
    ];

    const samplePostContent = [
        'Just launched our new AI-powered feature that helps teams collaborate more effectively...',
        'The future of work is here. Remote teams are outperforming traditional offices by 40%...',
        'Sharing my top 10 lessons from scaling a startup from 0 to $10M ARR...',
        'Why emotional intelligence matters more than IQ in leadership...',
        'The biggest mistake founders make is not listening to their customers...',
        'Here\'s how we reduced customer churn by 50% in just 3 months...',
        'The power of storytelling in sales - a thread on what actually works...',
        'Stop chasing vanity metrics. Focus on these 5 KPIs instead...',
        'My journey from engineer to CEO - lessons I wish I knew earlier...',
        'The LinkedIn algorithm changed again. Here\'s what\'s working now...'
    ];

    const sampleComments = [
        'This is incredibly insightful! The point about emotional intelligence resonates deeply with my experience.',
        'Great breakdown! I\'ve implemented similar strategies and seen amazing results.',
        'Thanks for sharing this valuable perspective. Would love to connect and discuss further!',
        'Spot on analysis! This aligns perfectly with what we\'re seeing in the market.',
        'Really appreciate you sharing these learnings. The startup community needs more of this!',
        'Fascinating data! Could you elaborate on the methodology behind these findings?',
        'This changed my perspective completely. Implementing this week!',
        'The ROI focus is key here. Too many companies miss this fundamental point.',
        'Brilliant insights as always! Your content consistently delivers value.',
        'This is gold! Saving this for our next strategy meeting.'
    ];

    const sampleHashtags = {
        '#Leadership': randomInRange(150, 300),
        '#SaaS': randomInRange(120, 250),
        '#Startup': randomInRange(180, 320),
        '#AI': randomInRange(200, 400),
        '#Marketing': randomInRange(100, 200),
        '#Growth': randomInRange(90, 180),
        '#Sales': randomInRange(80, 160),
        '#Tech': randomInRange(140, 280),
        '#Innovation': randomInRange(110, 220),
        '#Business': randomInRange(130, 260),
        '#Entrepreneur': randomInRange(95, 190),
        '#DigitalMarketing': randomInRange(85, 170)
    };

    // 1. ENGAGEMENT STATISTICS
    const dailyStats = {};
    let totalComments = 0, totalLikes = 0, totalShares = 0, totalFollows = 0;

    last30Days.forEach((date, index) => {
        // Higher activity on recent days, lower on older days
        const multiplier = Math.max(0.5, 1 - (index * 0.02));
        const dayStats = {
            comments: Math.round(randomInRange(25, 85) * multiplier),
            likes: Math.round(randomInRange(80, 200) * multiplier),
            shares: Math.round(randomInRange(15, 45) * multiplier),
            follows: Math.round(randomInRange(20, 60) * multiplier),
            connections: Math.round(randomInRange(10, 35) * multiplier)
        };
        dailyStats[date] = dayStats;
        totalComments += dayStats.comments;
        totalLikes += dayStats.likes;
        totalShares += dayStats.shares;
        totalFollows += dayStats.follows;
    });

    // Keep Engagement Analytics "Today" numbers exactly as requested
    const todayKey = new Date().toISOString().split('T')[0];
    dailyStats[todayKey] = {
        comments: 75,
        likes: 102,
        shares: 31,
        follows: 49,
        connections: dailyStats[todayKey]?.connections || 0
    };

    const topEngagedUsers = {};
    sampleAuthors.forEach(author => {
        topEngagedUsers[author] = randomInRange(15, 85);
    });

    const engagementStatistics = {
        initialized: true,
        totalComments,
        totalLikes,
        totalShares,
        totalFollows,
        totalPosts: randomInRange(500, 1200),
        dailyStats,
        topHashtags: sampleHashtags,
        topEngagedUsers,
        lastUpdated: new Date().toISOString()
    };

    await chrome.storage.local.set({ engagementStatistics });
    console.log('✅ Engagement statistics populated:', engagementStatistics);

    // 2. AUTOMATION POST RECORDS
    const automationPostRecords = [];
    for (let i = 0; i < 450; i++) {
        const daysAgo = randomInRange(0, 29);
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - daysAgo);
        timestamp.setHours(randomInRange(8, 22), randomInRange(0, 59), randomInRange(0, 59));

        const record = {
            id: `record_${Date.now()}_${i}`,
            timestamp: timestamp.toISOString(),
            keywords: sampleKeywords[randomInRange(0, sampleKeywords.length - 1)],
            authorName: sampleAuthors[randomInRange(0, sampleAuthors.length - 1)],
            postContent: samplePostContent[randomInRange(0, samplePostContent.length - 1)],
            generatedComment: sampleComments[randomInRange(0, sampleComments.length - 1)],
            postUrn: `urn:li:activity:${7000000000000000000 + randomInRange(0, 999999999)}`,
            actions: {
                liked: Math.random() > 0.2,
                commented: Math.random() > 0.15,
                shared: Math.random() > 0.7,
                followed: Math.random() > 0.6
            },
            status: Math.random() > 0.08 ? 'success' : 'failed'
        };
        automationPostRecords.push(record);
    }

    // Sort by timestamp descending (newest first)
    automationPostRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    await chrome.storage.local.set({ automationPostRecords });
    console.log('✅ Automation post records populated:', automationPostRecords.length, 'records');

    // 3. PROCESSING HISTORY (Automation + Networking Sessions)
    const processingHistory = [];

    // Automation sessions
    for (let i = 0; i < 1200; i++) {
        const daysAgo = randomInRange(0, 29);
        const startTime = new Date();
        startTime.setDate(startTime.getDate() - daysAgo);
        startTime.setHours(randomInRange(8, 20), randomInRange(0, 59), 0);
        
        const duration = randomInRange(300000, 1800000); // 5-30 minutes
        const processed = randomInRange(15, 60);
        const successful = Math.round(processed * (0.85 + Math.random() * 0.12));

        processingHistory.push({
            id: `auto_session_${Date.now()}_${i}`,
            type: 'automation',
            startTime: startTime.toISOString(),
            endTime: new Date(startTime.getTime() + duration).toISOString(),
            duration,
            keywords: sampleKeywords[randomInRange(0, sampleKeywords.length - 1)],
            target: processed + randomInRange(0, 10),
            processed,
            successful,
            failed: processed - successful,
            status: Math.random() > 0.1 ? 'completed' : (Math.random() > 0.5 ? 'stopped' : 'failed')
        });
    }

    // Networking sessions
    for (let i = 0; i < 995; i++) {
        const daysAgo = randomInRange(0, 29);
        const startTime = new Date();
        startTime.setDate(startTime.getDate() - daysAgo);
        startTime.setHours(randomInRange(9, 21), randomInRange(0, 59), 0);
        
        const duration = randomInRange(180000, 1200000); // 3-20 minutes
        const processed = randomInRange(20, 80);
        const successful = Math.round(processed * (0.75 + Math.random() * 0.2));

        processingHistory.push({
            id: `net_session_${Date.now()}_${i}`,
            type: 'networking',
            startTime: startTime.toISOString(),
            endTime: new Date(startTime.getTime() + duration).toISOString(),
            duration,
            query: sampleKeywords[randomInRange(0, sampleKeywords.length - 1)],
            keywords: sampleKeywords[randomInRange(0, sampleKeywords.length - 1)],
            target: processed + randomInRange(5, 20),
            processed,
            successful,
            failed: processed - successful,
            status: Math.random() > 0.12 ? 'completed' : (Math.random() > 0.5 ? 'stopped' : 'failed')
        });
    }

    // Sort by start time descending
    processingHistory.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    await chrome.storage.local.set({ processingHistory });
    console.log('✅ Processing history populated:', processingHistory.length, 'sessions');

    // 4. IMPORT RECORDS (CSV imports)
    const importHistory = [];
    for (let i = 0; i < 12; i++) {
        const daysAgo = randomInRange(0, 25);
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - daysAgo);
        
        const totalProfiles = randomInRange(50, 300);
        const successful = Math.round(totalProfiles * (0.88 + Math.random() * 0.1));

        importHistory.push({
            id: `import_${Date.now()}_${i}`,
            timestamp: timestamp.toISOString(),
            filename: `linkedin_profiles_${i + 1}.csv`,
            totalProfiles,
            successful,
            failed: totalProfiles - successful,
            status: 'completed'
        });
    }

    await chrome.storage.local.set({ importHistory });
    console.log('✅ Import history populated:', importHistory.length, 'imports');

    // 5. SCHEDULED POSTS (use scheduledFor field for proper date display)
    const scheduledPosts = [];
    for (let i = 0; i < 8; i++) {
        const daysAhead = randomInRange(1, 14);
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + daysAhead);
        scheduledDate.setHours(randomInRange(8, 18), randomInRange(0, 59), 0);

        scheduledPosts.push({
            id: `post_${Date.now()}_${i}`,
            content: samplePostContent[randomInRange(0, samplePostContent.length - 1)] + '\n\n#LinkedIn #Growth #Success',
            scheduledFor: scheduledDate.toISOString(),
            scheduledDate: scheduledDate.toISOString(),
            status: 'pending',
            createdAt: new Date().toISOString()
        });
    }

    await chrome.storage.local.set({ scheduledPosts });
    console.log('✅ Scheduled posts populated:', scheduledPosts.length, 'posts');

    // 6. IMPORT HISTORY (correct storage key for Import Actions History table)
    // Overwrite the importHistory with much more detailed profile-level data
    const importHistoryDetailed = [];
    for (let i = 0; i < 2500; i++) {
        const daysAgo = randomInRange(0, 29);
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - daysAgo);
        timestamp.setHours(randomInRange(8, 22), randomInRange(0, 59), randomInRange(0, 59));

        const profileName = sampleAuthors[randomInRange(0, sampleAuthors.length - 1)];
        const likes = randomInRange(1, 8);
        const comments = randomInRange(1, 5);
        const shares = randomInRange(0, 3);
        const follows = randomInRange(0, 2);
        const connectionsSent = Math.random() > 0.3 ? 1 : 0;

        importHistoryDetailed.push({
            id: `import_${Date.now()}_${i}`,
            timestamp: timestamp.toISOString(),
            date: timestamp.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }),
            profileName: profileName,
            profileUrl: `https://www.linkedin.com/in/${profileName.toLowerCase().replace(/\s+/g, '-')}-${randomInRange(100, 999)}`,
            connectionsSent: connectionsSent,
            likes: likes,
            comments: comments,
            shares: shares,
            follows: follows,
            status: Math.random() > 0.05 ? 'completed' : 'failed',
            postDetails: []
        });
    }

    importHistoryDetailed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    await chrome.storage.local.set({ importHistory: importHistoryDetailed });
    console.log('✅ Import history populated:', importHistoryDetailed.length, 'records');

    // 7. LEADS DATABASE (with proper query and date fields)
    const leads = [];
    const sampleHeadlines2 = ['CEO & Founder', 'VP of Engineering', 'Product Manager', 'Marketing Director', 'Sales Lead', 'Growth Hacker', 'Data Scientist', 'Software Engineer'];
    const sampleLocations2 = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA', 'Denver, CO', 'Chicago, IL', 'Los Angeles, CA'];
    const searchQueries = ['SaaS founders', 'Tech executives', 'Startup CEOs', 'Marketing leaders', 'Sales directors', 'Product managers', 'Engineering VPs', 'Growth marketers'];

    for (let i = 0; i < 1380; i++) {
        const daysAgo = randomInRange(0, 29);
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - daysAgo);
        timestamp.setHours(randomInRange(8, 22), randomInRange(0, 59), randomInRange(0, 59));

        const name = sampleAuthors[randomInRange(0, sampleAuthors.length - 1)];
        const nameParts = name.split(' ');
        const firstName = nameParts[0].toLowerCase();
        const lastName = nameParts[1]?.toLowerCase() || 'user';
        const email = Math.random() > 0.4 ? `${firstName}.${lastName}@company${randomInRange(1, 50)}.com` : null;
        const phone = Math.random() > 0.6 ? `+1 ${randomInRange(200, 999)}-${randomInRange(200, 999)}-${randomInRange(1000, 9999)}` : null;

        leads.push({
            id: `lead_${Date.now()}_${i}`,
            name,
            headline: sampleHeadlines2[randomInRange(0, sampleHeadlines2.length - 1)],
            location: sampleLocations2[randomInRange(0, sampleLocations2.length - 1)],
            query: searchQueries[randomInRange(0, searchQueries.length - 1)],
            searchQuery: searchQueries[randomInRange(0, searchQueries.length - 1)],
            timestamp: timestamp.toISOString(),
            date: timestamp.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }),
            addedAt: timestamp.toISOString(),
            email,
            phone,
            connected: Math.random() > 0.5,
            profileUrl: `https://www.linkedin.com/in/${firstName}-${lastName}-${randomInRange(100, 999)}`,
            actions: { viewed: true, connected: Math.random() > 0.5 }
        });
    }

    leads.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    await chrome.storage.local.set({ leads });
    console.log('✅ Leads database populated:', leads.length, 'leads');

    // SUMMARY
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DUMMY DATA POPULATION COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   • Total Engagements: ${totalComments + totalLikes + totalShares + totalFollows}`);
    console.log(`   • Comments: ${totalComments}`);
    console.log(`   • Likes: ${totalLikes}`);
    console.log(`   • Shares: ${totalShares}`);
    console.log(`   • Follows: ${totalFollows}`);
    console.log(`   • Automation Records: ${automationPostRecords.length}`);
    console.log(`   • Processing Sessions: ${processingHistory.length}`);
    console.log(`   • Import Records: ${importHistory.length}`);
    console.log(`   • Import History: ${importHistoryDetailed.length}`);
    console.log(`   • Leads Database: ${leads.length}`);
    console.log(`   • Scheduled Posts: ${scheduledPosts.length}`);
    console.log('\n🔄 Please refresh the extension popup to see the data!');
    console.log('='.repeat(60));

    return {
        success: true,
        stats: {
            totalEngagements: totalComments + totalLikes + totalShares + totalFollows,
            comments: totalComments,
            likes: totalLikes,
            shares: totalShares,
            follows: totalFollows,
            automationRecords: automationPostRecords.length,
            sessions: processingHistory.length,
            imports: importHistory.length,
            importHistory: importHistoryDetailed.length,
            leads: leads.length,
            scheduledPosts: scheduledPosts.length
        }
    };
})();
