/**
 * LinkedIn Profile Scanner
 * Scans user's LinkedIn profile and extracts all data for AI content generation
 */

import { randomDelay } from '../shared/utils/helpers.js';

class LinkedInProfileScanner {
    constructor() {
        this.isScanning = false;
    }

    async scanProfile(tabId) {
        if (this.isScanning) {
            console.log("PROFILE SCANNER: Scan already in progress");
            return { success: false, error: "Scan already in progress" };
        }

        this.isScanning = true;
        console.log("PROFILE SCANNER: Starting profile scan...");

        try {
            console.log("PROFILE SCANNER: Step 1 - Finding profile link...");
            const profileUrl = await this.findProfileLink(tabId);
            
            if (!profileUrl) {
                throw new Error("Could not find LinkedIn profile link. Make sure you're on LinkedIn Feed.");
            }

            console.log("PROFILE SCANNER: Found profile URL:", profileUrl);

            console.log("PROFILE SCANNER: Step 2 - Opening profile page...");
            const profileTab = await chrome.tabs.create({
                url: profileUrl,
                active: true
            });

            await randomDelay(3000, 5000);

            console.log("PROFILE SCANNER: Step 3 - Extracting profile data...");
            const profileData = await this.extractProfileData(profileTab.id);

            try {
                await chrome.tabs.remove(profileTab.id);
            } catch (e) {}

            // Step 4: Extract all posts from recent-activity page
            console.log("PROFILE SCANNER: Step 4 - Extracting all posts from recent-activity page...");
            const allPosts = await this.extractAllPosts(profileData.profileUrl || profileUrl);
            
            // Merge posts - combine initial posts with all posts from activity page
            const mergedPosts = [...new Set([...(profileData.posts || []), ...allPosts])];
            profileData.posts = mergedPosts;
            profileData.totalPostsCount = mergedPosts.length;

            console.log("PROFILE SCANNER: Step 5 - Saving to database...");
            const savedData = await this.saveToDatabase(profileUrl, profileData);

            this.isScanning = false;
            return { success: true, data: savedData, totalPosts: mergedPosts.length };

        } catch (error) {
            console.error("PROFILE SCANNER: Error during scan:", error);
            this.isScanning = false;
            return { success: false, error: error.message };
        }
    }

    async findProfileLink(tabId) {
        try {
            const result = await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => {
                    const sidebars = document.getElementsByTagName('aside');
                    let targetContainer = null;

                    if (sidebars.length > 0) {
                        targetContainer = sidebars[0];
                    } else {
                        targetContainer = document.body;
                    }

                    const links = targetContainer.getElementsByTagName('a');
                    let foundLink = null;

                    for (let i = 0; i < links.length; i++) {
                        const rawHref = links[i].getAttribute('href');
                        if (rawHref && rawHref.startsWith('/in/')) {
                            foundLink = rawHref.startsWith('http') ? rawHref : window.location.origin + rawHref;
                            break;
                        }
                    }

                    return foundLink;
                }
            });

            return result[0]?.result || null;
        } catch (error) {
            console.error("PROFILE SCANNER: Error finding profile link:", error);
            return null;
        }
    }

    async extractProfileData(tabId) {
        try {
            const result = await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => {
                    return (function pureTextProfileExtractor() {
                    console.clear();
                    console.log("🚀 Starting Bulletproof Text-Based Extraction...");

                    // Helper function to sanitize text
                    function clean(text) {
                        if (!text) return "";
                        return text.replace(/…\s*more/gi, "").replace(/^\s*[\r\n]/gm, "").replace(/\s+/g, " ").trim();
                    }

                    // 1. Get raw text from the entire page
                    const rawText = document.body.innerText || "";

                    // 2. Define exact UI noise to completely destroy
                    const exactJunk = new Set([
                        "0 notifications", "Skip to main content", "Home", "My Network", "Jobs",
                        "Messaging", "Notifications", "Me", "For Business", "Create a post",
                        "Posts", "Comments", "Videos", "Images", "Top Voices", "Companies",
                        "Groups", "Newsletters", "Schools", "Show all", "Like", "Comment",
                        "Repost", "Send", "Show credential", "Show project", "Add section",
                        "Enhance profile", "Open to", "Get started", "Add services", "Private to you",
                        "Discover who's viewed your profile.", "Check out who's engaging with your posts.",
                        "See how often you appear in search results.", "Add verification badge",
                        "LinkedIn helped me get this job", "helped me get this job", "Contact info",
                        "Profile language", "Who your viewers also viewed", "People you may know", "You might like",
                        "Received", "Given", "Ask for a recommendation", "Message", "View", "Connect", "Follow"
                    ]);

                    // 3. Clean the text line-by-line using smart filters
                    let lines = rawText.split('\n').map(l => l.trim()).filter(l => {
                        if (!l) return false;
                        if (exactJunk.has(l)) return false;
                        if (/^\d+$/.test(l)) return false;
                        if (/^\d+\s+(reactions?|comments?|reposts?|views|followers)$/i.test(l)) return false;
                        if (l.includes("Reactivate Premium") || l.includes("Try Premium")) return false;
                        if (l.endsWith(".jpg") || l.endsWith(".png") || l.endsWith(".pdf")) return false;
                        if (l === "• You" || l === "You" || l.toLowerCase().includes("reposted this")) return false;
                        if (l.toLowerCase().startsWith("show all ")) return false;
                        if (l === "·" || l === "•") return false;
                        return true;
                    });

                    lines = lines.map(l => clean(l));
                    lines = lines.filter((l, i, a) => i === 0 || l !== a[i-1]);

                    const data = {
                        name: "", headline: "", location: "", connections: "", about: "",
                        posts: [], experience: [], education: [], certifications: [], projects: [],
                        skills: [], interests: [], language: "", profileViews: "", profileUrl: ""
                    };

                    // Get profile URL
                    data.profileUrl = window.location.href.split('?')[0];

                    const sectionHeaders = [
                        "About", "Activity", "Experience", "Education", 
                        "Licenses & certifications", "Projects", "Skills", 
                        "Recommendations", "Interests"
                    ];

                    // --- EXTRACT TOP SKILLS FIRST ---
                    const topSkillsIdx = lines.findIndex(l => l === "Top skills");
                    if (topSkillsIdx !== -1) {
                        if (lines[topSkillsIdx + 1]) {
                            data.skills.push(...lines[topSkillsIdx + 1].split(/[•·]/).map(s => clean(s)).filter(Boolean));
                        }
                        lines.splice(topSkillsIdx, 2); 
                    }

                    // --- EXTRACT TOP CARD ---
                    let topBound = lines.findIndex(l => sectionHeaders.includes(l));
                    if (topBound === -1) topBound = lines.length;
                    let topLines = lines.slice(0, topBound);

                    const connIdx = topLines.findIndex(l => l.toLowerCase().includes("connections"));
                    if (connIdx !== -1) data.connections = topLines[connIdx];

                    const viewIdx = topLines.findIndex(l => l.toLowerCase().includes("profile views"));
                    if (viewIdx !== -1) data.profileViews = topLines[viewIdx];

                    const cleanTop = topLines.filter(l => !l.toLowerCase().includes("connections") && !l.toLowerCase().includes("profile views") && !l.toLowerCase().includes("search appearances") && !l.toLowerCase().includes("post impressions") && !l.includes("Past 7 days"));
                    
                    if (cleanTop.length > 0) data.name = cleanTop[0];
                    if (cleanTop.length > 1) data.headline = cleanTop[1];
                    if (cleanTop.length > 2) data.location = cleanTop[2];

                    lines = lines.filter(l => l !== data.name && l !== data.headline);

                    // --- SECTION PARSER ---
                    function getSectionLines(header) {
                        let start = lines.findIndex(l => l === header);
                        if (start === -1) return [];
                        let end = lines.length;
                        for (let i = start + 1; i < lines.length; i++) {
                            if (sectionHeaders.includes(lines[i])) {
                                end = i;
                                break;
                            }
                        }
                        return lines.slice(start + 1, end);
                    }

                    // --- ABOUT ---
                    data.about = getSectionLines("About").join(" ");

                    // --- POSTS ---
                    const actLines = getSectionLines("Activity");
                    let currentPost = [];
                    const timeRegex = /^\d+[dwmoqy]\s*•/i;
                    
                    actLines.forEach(l => {
                        if (timeRegex.test(l)) {
                            if (currentPost.length > 0 && currentPost.join(" ").length > 20) {
                                data.posts.push(currentPost.join(" "));
                            }
                            currentPost = [];
                        } else {
                            currentPost.push(l);
                        }
                    });
                    if (currentPost.length > 0 && currentPost.join(" ").length > 20) data.posts.push(currentPost.join(" "));

                    // --- GENERIC LIST CHUNKER ---
                    function chunkList(linesArray) {
                        let items = [];
                        let current = [];
                        const dateRegex = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}|\b\d{4}\s*[–-]\s*(?:Present|\d{4})\b/i;
                        
                        for (let i = 0; i < linesArray.length; i++) {
                            let l = linesArray[i];
                            
                            if (l.includes("skills") && l.includes("+")) continue;
                            if (l.startsWith("Issued ")) continue;
                            
                            let hasDate = current.some(x => dateRegex.test(x));
                            let nextLinesHaveDate = linesArray.slice(i, i+3).some(x => dateRegex.test(x));

                            if (hasDate && l.length < 60 && nextLinesHaveDate && !dateRegex.test(l) && !l.startsWith("•") && !l.startsWith("-")) {
                                items.push(current.join(" | "));
                                current = [];
                            }
                            current.push(l);
                        }
                        if (current.length > 0) items.push(current.join(" | "));
                        return items;
                    }

                    data.experience = chunkList(getSectionLines("Experience"));
                    data.education = chunkList(getSectionLines("Education"));
                    data.certifications = chunkList(getSectionLines("Licenses & certifications"));
                    data.projects = chunkList(getSectionLines("Projects"));

                    // --- SKILLS ---
                    const skillLines = getSectionLines("Skills");
                    skillLines.forEach(l => {
                        if (l.length < 50 && !l.includes("Endorsed by")) {
                            data.skills.push(...l.split(/[•·]/).map(s => clean(s)).filter(Boolean));
                        }
                    });

                    // --- INTERESTS ---
                    const intLines = getSectionLines("Interests");
                    intLines.forEach(l => {
                        if (l.length < 40 && !l.includes("Managing General") && !l.includes("stuff")) {
                            data.interests.push(l);
                        }
                    });

                    // --- FINAL CLEANUP ---
                    for(let key in data) {
                        if(Array.isArray(data[key])) {
                            data[key] = [...new Set(data[key].map(clean).filter(Boolean))];
                        }
                    }

                    console.log(JSON.stringify(data, null, 2));
                    return data;
                    })();
                }
            });

            await new Promise(resolve => setTimeout(resolve, 3000));
            return result[0]?.result || {};
        } catch (error) {
            console.error("PROFILE SCANNER: Error extracting profile data:", error);
            return {};
        }
    }

    async extractAllPosts(profileUrl) {
        try {
            // Construct recent-activity URL
            const activityUrl = profileUrl.endsWith('/') 
                ? profileUrl + 'recent-activity/all/' 
                : profileUrl + '/recent-activity/all/';
            
            console.log("PROFILE SCANNER: Opening recent-activity page:", activityUrl);
            
            const activityTab = await chrome.tabs.create({
                url: activityUrl,
                active: true
            });

            await randomDelay(4000, 6000);

            // Scroll to load all posts
            const allPosts = await this.scrollAndExtractPosts(activityTab.id);

            try {
                await chrome.tabs.remove(activityTab.id);
            } catch (e) {}

            return allPosts;
        } catch (error) {
            console.error("PROFILE SCANNER: Error extracting all posts:", error);
            return [];
        }
    }

    async scrollAndExtractPosts(tabId) {
        const allPosts = [];
        let lastPostCount = 0;
        let noNewPostsCount = 0;
        const maxScrollAttempts = 20;

        for (let i = 0; i < maxScrollAttempts; i++) {
            // Extract posts from current view
            const result = await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => {
                    const posts = [];
                    const postElements = document.querySelectorAll('[data-view-name="feed-commentary"], .update-components-text, .feed-shared-update-v2__description');
                    
                    postElements.forEach(el => {
                        const clone = el.cloneNode(true);
                        clone.querySelectorAll('button, .see-more, .feed-shared-update-v2__social, .social-details-social-counts').forEach(b => b.remove());
                        
                        let txt = clone.innerText || clone.textContent || "";
                        txt = txt.replace(/…\s*more/gi, "").replace(/\s+/g, " ").trim();
                        
                        if (txt && txt.length > 30 && !txt.startsWith("http") && !txt.startsWith("#") && !posts.includes(txt)) {
                            posts.push(txt);
                        }
                    });
                    
                    return posts;
                }
            });

            const newPosts = result[0]?.result || [];
            newPosts.forEach(p => {
                if (!allPosts.includes(p)) {
                    allPosts.push(p);
                }
            });

            console.log(`PROFILE SCANNER: Scroll ${i+1}, found ${allPosts.length} total posts`);

            // Check if we found new posts
            if (allPosts.length === lastPostCount) {
                noNewPostsCount++;
                if (noNewPostsCount >= 3) {
                    console.log("PROFILE SCANNER: No new posts found after 3 scrolls, stopping");
                    break;
                }
            } else {
                noNewPostsCount = 0;
            }
            lastPostCount = allPosts.length;

            // Scroll down
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => {
                    window.scrollTo(0, document.body.scrollHeight);
                }
            });

            await randomDelay(2000, 3000);
        }

        console.log(`PROFILE SCANNER: Total posts extracted: ${allPosts.length}`);
        return allPosts;
    }

    async saveToDatabase(profileUrl, profileData) {
        try {
            const storage = await chrome.storage.local.get(['authToken', 'apiBaseUrl']);
            const token = storage.authToken;
            const apiUrl = storage.apiBaseUrl || 'https://kommentify.com';

            if (!token) {
                throw new Error("No auth token found");
            }

            const response = await fetch(apiUrl + '/api/linkedin-profile', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    profileUrl: profileUrl,
                    name: profileData.name,
                    headline: profileData.headline,
                    location: profileData.location,
                    connections: profileData.connections,
                    about: profileData.about,
                    language: profileData.language,
                    profileViews: profileData.profileViews,
                    posts: profileData.posts || [],
                    experience: profileData.experience || [],
                    education: profileData.education || [],
                    certifications: profileData.certifications || [],
                    projects: profileData.projects || [],
                    skills: profileData.skills || [],
                    interests: profileData.interests || [],
                    postsTokenLimit: 3000
                })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log("PROFILE SCANNER: Data saved successfully");
                return result.data;
            } else {
                throw new Error(result.error || "Failed to save profile data");
            }
        } catch (error) {
            console.error("PROFILE SCANNER: Error saving to database:", error);
            throw error;
        }
    }
}

export const profileScanner = new LinkedInProfileScanner();
