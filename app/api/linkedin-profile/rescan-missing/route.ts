import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST - Re-scan stored full page text for missing data sections
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);

    const body = await request.json();
    const { missingSections } = body; // Array of sections to re-extract: ['experience', 'education', 'certifications', 'projects', 'posts']

    // Get stored profile data with full page text
    const profileData = await (prisma as any).linkedInProfileData.findUnique({
      where: { userId: payload.userId }
    });

    if (!profileData || !profileData.fullPageText) {
      return NextResponse.json({ 
        success: false, 
        error: 'No stored full page text found. Please scan your profile first.' 
      }, { status: 400 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ success: false, error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Build targeted prompt for missing sections
    const sectionPrompts: Record<string, string> = {
      experience: `EXPERIENCE EXTRACTION - Look carefully for:
- Company names (look for "Inc", "LLC", "Ltd", "Corp", "Technologies", "Solutions")
- Job titles (look for "Engineer", "Manager", "Developer", "Director", "Lead", "Senior", "Junior")
- Date ranges (look for "Jan 2020 - Present", "2020 - 2023", "Full-time", "Part-time")
- Location and description
Format each as: "Company | Title | Date Range | Description"`,

      education: `EDUCATION EXTRACTION - Look carefully for:
- University/school names (look for "University", "Institute", "College", "School")
- Degree types (look for "Bachelor's", "Master's", "PhD", "B.S.", "M.S.", "MBA")
- Fields of study and graduation years
Format each as: "School | Degree | Years"`,

      certifications: `CERTIFICATIONS EXTRACTION - Look carefully for:
- Certificate names (look for "Certified", "Certificate", "Professional")
- Issuing organizations (look for "Google", "AWS", "Microsoft", "Coursera", "Udemy")
- Issue dates
Format each as: "Certificate Name | Issuing Organization | Date"`,

      projects: `PROJECTS EXTRACTION - Look carefully for:
- Project names and descriptions
- Technologies used
- Links and dates
Format each as: "Project Name | Description | Technologies"`,

      posts: `POSTS EXTRACTION - Find exactly 10 posts (or all available):
- Look in "Activity" section with time markers like "2mo •", "1y •", "3w •"
- Look in "Featured" section
- Each post is a paragraph of text the user wrote
- Extract FULL text of each post, not truncated
Return exactly 10 posts if available, or all found if less than 10`
    };

    const targetSections = missingSections || ['experience', 'education', 'certifications', 'projects', 'posts'];
    const extractionInstructions = targetSections.map((s: string) => sectionPrompts[s] || '').join('\n\n');

    // Call OpenAI to re-extract missing sections
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
          content: `You are a LinkedIn profile data extractor. Re-analyze the provided text and extract ONLY the specified missing sections.

${extractionInstructions}

CRITICAL RULES:
1. Search the ENTIRE text thoroughly for each section
2. NEVER return empty arrays unless absolutely nothing exists
3. Even partial information is valuable
4. Return ONLY a JSON object with the requested sections

JSON SCHEMA:
{
  "experience": ["string"],
  "education": ["string"],
  "certifications": ["string"],
  "projects": ["string"],
  "posts": ["string"]
}

Return ONLY valid JSON with the sections you were asked to extract.`
        }, {
          role: 'user',
          content: `Re-extract these sections: ${targetSections.join(', ')}\n\nProfile text:\n\n${profileData.fullPageText.substring(0, 15000)}`
        }],
        response_format: { type: 'json_object' },
        max_tokens: 4000
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      return NextResponse.json({ success: false, error: errorData.error?.message || 'OpenAI API error' }, { status: 500 });
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ success: false, error: 'No content from AI' }, { status: 500 });
    }

    const extractedData = JSON.parse(content);

    // Merge extracted data with existing data
    const updateData: any = {};
    
    if (extractedData.experience && extractedData.experience.length > 0) {
      const existing = JSON.parse(profileData.experience || '[]');
      updateData.experience = JSON.stringify([...new Set([...existing, ...extractedData.experience])]);
    }
    if (extractedData.education && extractedData.education.length > 0) {
      const existing = JSON.parse(profileData.education || '[]');
      updateData.education = JSON.stringify([...new Set([...existing, ...extractedData.education])]);
    }
    if (extractedData.certifications && extractedData.certifications.length > 0) {
      const existing = JSON.parse(profileData.certifications || '[]');
      updateData.certifications = JSON.stringify([...new Set([...existing, ...extractedData.certifications])]);
    }
    if (extractedData.projects && extractedData.projects.length > 0) {
      const existing = JSON.parse(profileData.projects || '[]');
      updateData.projects = JSON.stringify([...new Set([...existing, ...extractedData.projects])]);
    }
    if (extractedData.posts && extractedData.posts.length > 0) {
      const existing = JSON.parse(profileData.posts || '[]');
      updateData.posts = JSON.stringify([...new Set([...existing, ...extractedData.posts])]);
      updateData.totalPostsCount = JSON.parse(updateData.posts).length;
    }

    // Update profile if we have new data
    if (Object.keys(updateData).length > 0) {
      await (prisma as any).linkedInProfileData.update({
        where: { userId: payload.userId },
        data: updateData
      });
    }

    return NextResponse.json({ 
      success: true, 
      extracted: extractedData,
      message: `Re-scanned and updated ${Object.keys(updateData).length} sections`
    });

  } catch (error: any) {
    console.error('Rescan missing error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
