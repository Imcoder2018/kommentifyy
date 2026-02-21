/**
 * BULLETPROOF TEXT-BASED PROFILE SCRAPER
 * Uses text-based extraction that works on all devices
 * This script is injected into profile pages to extract comprehensive data.
 */
export const profileScraper = async () => {
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
        if (/^\d+$/.test(l)) return false; // Drops isolated numbers like "1", "8"
        if (/^\d+\s+(reactions?|comments?|reposts?|views|followers)$/i.test(l)) return false; // Drops metrics
        if (l.includes("Reactivate Premium") || l.includes("Try Premium")) return false;
        if (l.endsWith(".jpg") || l.endsWith(".png") || l.endsWith(".pdf")) return false; // Drops media thumbnails
        if (l === "• You" || l === "You" || l.toLowerCase().includes("reposted this")) return false;
        if (l.toLowerCase().startsWith("show all ")) return false;
        if (l === "·" || l === "•") return false;
        return true;
    });

    // Strip "… more" from the end of lines
    lines = lines.map(l => clean(l));

    // Deduplicate consecutive lines
    lines = lines.filter((l, i, a) => i === 0 || l !== a[i-1]);

    const data = {
        name: "", headline: "", location: "", connections: "", about: "",
        posts: [], experience: [], education: [], certifications: [], projects: [],
        skills: [], interests: [], language: "", profileViews: ""
    };

    const sectionHeaders = [
        "About", "Activity", "Experience", "Education", 
        "Licenses & certifications", "Projects", "Skills", 
        "Recommendations", "Interests"
    ];

    // --- EXTRACT TOP SKILLS FIRST (So they don't pollute 'About') ---
    const topSkillsIdx = lines.findIndex(l => l === "Top skills");
    if (topSkillsIdx !== -1) {
        if (lines[topSkillsIdx + 1]) {
            data.skills.push(...lines[topSkillsIdx + 1].split(/[•·]/).map(s => clean(s)).filter(Boolean));
        }
        // Remove from the lines pool so it doesn't get swept into the About section
        lines.splice(topSkillsIdx, 2); 
    }

    // --- EXTRACT TOP CARD ---
    let topBound = lines.findIndex(l => sectionHeaders.includes(l));
    if (topBound === -1) topBound = lines.length;
    let topLines = lines.slice(0, topBound);

    // Find Connections & Views dynamically
    const connIdx = topLines.findIndex(l => l.toLowerCase().includes("connections"));
    if (connIdx !== -1) data.connections = topLines[connIdx];

    const viewIdx = topLines.findIndex(l => l.toLowerCase().includes("profile views"));
    if (viewIdx !== -1) data.profileViews = topLines[viewIdx];

    // Name, Headline, and Location are reliably the first 3 clean strings
    const cleanTop = topLines.filter(l => !l.toLowerCase().includes("connections") && !l.toLowerCase().includes("profile views") && !l.toLowerCase().includes("search appearances") && !l.toLowerCase().includes("post impressions") && !l.includes("Past 7 days"));
    
    if (cleanTop.length > 0) data.name = cleanTop[0];
    if (cleanTop.length > 1) data.headline = cleanTop[1];
    if (cleanTop.length > 2) data.location = cleanTop[2];

    // **CRITICAL FIX**: Wipe Name and Headline from the rest of the document to prevent post-pollution
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
    const timeRegex = /^\d+[dwmoqy]\s*•/i; // Matches "1d •", "2mo •", etc.
    
    actLines.forEach(l => {
        if (timeRegex.test(l)) {
            // New post detected by time stamp. Save the previous one.
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
        // Regex to identify date strings indicating a specific job/degree
        const dateRegex = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}|\b\d{4}\s*[–-]\s*(?:Present|\d{4})\b/i;
        
        for (let i = 0; i < linesArray.length; i++) {
            let l = linesArray[i];
            
            // Clean up UI bleed
            if (l.includes("skills") && l.includes("+")) continue; // Skips "+5 skills"
            if (l.startsWith("Issued ")) continue;
            
            let hasDate = current.some(x => dateRegex.test(x));
            let nextLinesHaveDate = linesArray.slice(i, i+3).some(x => dateRegex.test(x));

            // If the current array has a date, AND we hit a short string (like a new Job Title), AND there is a new date coming up soon... Split!
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
        // Drop long bio descriptions to just keep the Account names
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

    // LOG DATA
    console.log(JSON.stringify(data, null, 2));
    return data;
})();
};