import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST - Restructure LinkedIn profile text using AI
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token);
    const { profileText, profileUrl } = await request.json();

    if (!profileText) {
      return NextResponse.json({ success: false, error: 'Profile text is required' }, { status: 400 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ success: false, error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Call OpenAI to restructure the profile text
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'system',
          content: `You are a highly skilled LinkedIn profile data extractor. You will be provided with raw text scraped from a LinkedIn profile. 
Your task is to carefully analyze this text and extract all relevant professional information into a structured JSON format.

CRITICAL INSTRUCTIONS - YOU MUST EXTRACT ALL DATA:
1. NEVER output "N/A" or empty arrays unless you have searched the ENTIRE text thoroughly. The raw text can be messy and out of order - look carefully!
2. For "about", extract the full professional summary or bio. Do not truncate it.
3. For "skills", look for lists of technologies, soft skills, tools, or domain expertise. Return as an array of strings. Look in "Skills" section AND throughout the text.
4. For "experience", extract ALL job roles - look for company names, job titles, date ranges. Format each entry as "Company | Title | Date Range | Description". Even partial info is valuable!
5. For "education", extract ALL degrees/schools. Look for university names, degree types, years. Format each entry as "School | Degree | Date Range".
6. For "certifications", extract ALL certificates or licenses. Look for "Licenses & certifications" section, credential names, issuing organizations.
7. For "projects", extract ALL project details. Look for "Projects" section, project names, descriptions, links.
8. For "posts", you MUST extract exactly 10 posts (or all available if less than 10). Look in "Activity" and "Featured" sections for post content - these are paragraphs of text the user wrote.

EXPERIENCE EXTRACTION - CRITICAL:
- Look for patterns like: "Company Name", "Job Title", "Jan 2020 - Present", "Full-time"
- Experience entries often appear as blocks with company, title, date, location, description
- Even if incomplete, extract what you find: "Company | Title | Dates"
- Search for common company indicators: "Inc", "LLC", "Ltd", "Corp", "Technologies", "Solutions"

EDUCATION EXTRACTION - CRITICAL:
- Look for patterns like: "University Name", "Bachelor's", "Master's", "PhD", "2020 - 2024"
- Common university keywords: "University", "Institute", "College", "School"
- Extract even partial: "School Name | Degree Type | Years"

CERTIFICATIONS EXTRACTION - CRITICAL:
- Look in "Licenses & certifications" section
- Patterns: "Certificate Name", "Issuing Organization", "Issued Date"
- Common cert keywords: "Certified", "Certificate", "Professional", "Google", "AWS", "Microsoft", "Coursera"

PROJECTS EXTRACTION - CRITICAL:
- Look in "Projects" section
- Extract project name and description
- Look for links, technologies used, dates

POSTS EXTRACTION - MUST FIND 10:
- Posts are in "Activity" section with time markers like "2mo •", "1y •", "3w •"
- Posts are also in "Featured" section
- Each post is a paragraph of text the user wrote (not just activity notifications)
- Extract the FULL text of each post, not truncated
- If you find less than 10 posts, extract all available posts

=== TEXT PROCESSING STRATEGY (LEARN FROM THIS APPROACH) ===

When processing raw LinkedIn text, follow this proven extraction strategy:

STEP 1 - JUNK REMOVAL:
Remove these exact UI elements that pollute the text:
- "0 notifications total", "Skip to search", "Skip to main content", "Keyboard shortcuts"
- "Home", "My Network", "Jobs", "Messaging", "Notifications", "Me", "For Business"
- "Create a post", "Posts", "Comments", "Videos", "Images", "Top Voices"
- "Like", "Comment", "Repost", "Send", "Show credential", "Show project"
- "Add section", "Enhance profile", "Open to", "Get started", "Add services"
- "Discover who's viewed your profile", "Check out who's engaging with your posts"
- "Show all analytics", "Show all services", "Show all posts"
- "Message", "View", "Connect", "Follow", "Following"
- Lines matching /^\\d+$/ (standalone numbers)
- Lines containing "notifications" (case insensitive)
- Lines matching /^\\d{1,3}(,\\d{3})*\\s+followers/i
- Lines matching /(first|second|third) degree connection/i
- Lines ending with ".jpg", ".png", ".pdf"
- Lines that are just "·" or "•" or "You" or "• You"

STEP 2 - SECTION IDENTIFICATION:
Identify these section headers to organize extraction:
- "About" -> about section
- "Activity" -> posts section
- "Experience" -> experience array
- "Education" -> education array
- "Licenses & certifications" -> certifications array
- "Projects" -> projects array
- "Skills" -> skills array
- "Interests" -> interests array
- "Featured" -> posts (featured posts)

STEP 3 - TOP CARD EXTRACTION:
The first few lines before any section header contain:
- Line 0: Name
- Line 1: Headline (professional title)
- Line 2+: Location (often near "Contact info")
- Look for "connections" pattern for connection count
- Look for "profile views" or "followers" for profile metrics

STEP 4 - SECTION PARSING:
- About: Concatenate all lines until next section header
- Experience: Each entry starts with a date pattern like "Jan 2020 – Present" or "2020 – 2023"
- Education: Similar date patterns, school names often prominent
- Skills: Often comma or bullet separated lists
- Posts: Look for time markers like "2mo •" or "1y •" that indicate post boundaries

STEP 5 - CLEANUP:
- Remove duplicate lines
- Remove lines that are UI artifacts
- Ensure arrays don't contain empty strings
- Trim whitespace from all values

=== JSON SCHEMA (MUST MATCH EXACTLY) ===
{
  "name": "string",
  "headline": "string",
  "location": "string",
  "connections": "string (e.g., '500+ connections')",
  "profileViews": "string (e.g., '1,151 followers')",
  "about": "string",
  "skills": ["string", "string"],
  "experience": ["string", "string"],
  "education": ["string", "string"],
  "certifications": ["string", "string"],
  "projects": ["string", "string"],
  "posts": ["string", "string"]
}

Return ONLY valid JSON. No explanations.`
        }, {
          role: 'user',
          content: `Extract and structure this LinkedIn profile text:\n\n${profileText}`
        }],
        response_format: { type: 'json_object' },
        max_tokens: 4000
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error('OpenAI API error:', openaiResponse.status, errorData);
      return NextResponse.json({ success: false, error: errorData.error?.message || 'OpenAI API error' }, { status: 500 });
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ success: false, error: 'No content from AI' }, { status: 500 });
    }

    try {
      const structuredData = JSON.parse(content);
      return NextResponse.json({ success: true, data: structuredData });
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json({ success: false, error: 'Failed to parse AI response' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Restructure profile error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
