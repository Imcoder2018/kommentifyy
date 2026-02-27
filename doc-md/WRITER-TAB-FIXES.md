# Writer Tab Bugs & Fixes

## Summary
Analysis of `app/dashboard/page.tsx` and `app/dashboard/components/WriterTabNew.tsx` identified several bugs and missing features.

---

## Bug 1: Post Button Uses OAuth API (Requires Setup)

**Location:** `app/dashboard/page.tsx` lines 651-687

**Issue:** The `sendToExtension` function when `writerUseLinkedInAPI` is true calls `/api/linkedin/post` which requires OAuth to be configured. Most users won't have OAuth set up.

**Current Code:**
```typescript
if (writerUseLinkedInAPI) {
    const res = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            content: writerContent,
            mediaUrl: writerMediaBlobUrl || null,
            mediaType: writerMediaType || null
        }),
    });
    // ...
}
```

**Fix:** Use extension's `linkedin_post_via_api` command which uses Voyager API directly (no OAuth needed):
```typescript
if (writerUseLinkedInAPI) {
    showToast('Posting via LinkedIn Voyager API...', 'info');
    setWriterStatus('Posting via LinkedIn Voyager API...');
    try {
        const cmdData: any = { content: writerContent };
        if (writerMediaBlobUrl) {
            cmdData.mediaUrl = writerMediaBlobUrl;
            cmdData.mediaType = writerMediaType;
        }
        const res = await fetch('/api/extension/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ command: 'linkedin_post_via_api', data: cmdData }),
        });
        // ... handle response
    }
}
```

---

## Bug 2: Missing Personal Brand Strategy State Variables

**Location:** `app/dashboard/page.tsx` state declarations (around line 124)

**Issue:** WriterTabNew.tsx expects these props but they're not defined:
- `userGoal`, `setUserGoal`
- `userTargetAudience`, `setUserTargetAudience` 
- `userWritingStyle`, `setUserWritingStyle`
- `userWritingStyleSource`, `setUserWritingStyleSource`
- `goalsLoading`, `goalsSuggesting`

**Fix:** Add after line 124 (`writerInspirationSourceNames`):
```typescript
// Personal Brand Strategy state
const [userGoal, setUserGoal] = useState<string>('');
const [userTargetAudience, setUserTargetAudience] = useState<string>('');
const [userWritingStyle, setUserWritingStyle] = useState<string>('');
const [userWritingStyleSource, setUserWritingStyleSource] = useState<string>('user_default');
const [goalsLoading, setGoalsLoading] = useState(false);
const [goalsSuggesting, setGoalsSuggesting] = useState(false);
```

---

## Bug 3: Missing Personal Brand Strategy Functions

**Location:** `app/dashboard/page.tsx` (add after `selectTopicSuggestion` function around line 1382)

**Issue:** WriterTabNew.tsx calls `suggestGoals`, `saveUserGoals`, `loadUserGoals` but they don't exist.

**Fix:** Add these functions:
```typescript
// Personal Brand Strategy functions
const suggestGoals = async () => {
    if (isFreePlan) { setShowUpgradeModal(true); return; }
    if (!voyagerData) { showToast('Please scan your LinkedIn profile first', 'info'); return; }
    setGoalsSuggesting(true);
    try {
        const token = localStorage.getItem('authToken');
        if (!token) { showToast('Not authenticated', 'error'); return; }
        const res = await fetch('/api/ai/suggest-goals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                profileData: { headline: voyagerData.headline, about: voyagerData.about, location: voyagerData.location, experience: voyagerData.experience, recentPosts: voyagerData.recentPosts },
                model: writerModel
            }),
        });
        const data = await res.json();
        if (data.success && data.goals) {
            setUserGoal(data.goals.goal || '');
            setUserTargetAudience(data.goals.targetAudience || '');
            showToast('Strategy suggested successfully!', 'success');
        } else { showToast(data.error || 'Failed to suggest strategy', 'error'); }
    } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
    finally { setGoalsSuggesting(false); }
};

const saveUserGoals = async () => {
    if (!userGoal.trim() && !userTargetAudience.trim()) { showToast('Please enter at least a goal or target audience', 'error'); return; }
    try {
        const token = localStorage.getItem('authToken');
        if (!token) { showToast('Not authenticated', 'error'); return; }
        const res = await fetch('/api/user-goals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ goal: userGoal, targetAudience: userTargetAudience }),
        });
        const data = await res.json();
        if (data.success) { showToast('Strategy saved successfully!', 'success'); }
        else { showToast(data.error || 'Failed to save strategy', 'error'); }
    } catch (e: any) { showToast('Error: ' + e.message, 'error'); }
};

const loadUserGoals = async () => {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setGoalsLoading(true);
        const res = await fetch('/api/user-goals', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.success && data.goals) {
            setUserGoal(data.goals.goal || '');
            setUserTargetAudience(data.goals.targetAudience || '');
        }
    } catch (e: any) { console.error('Failed to load user goals:', e); }
    finally { setGoalsLoading(false); }
};
```

---

## Bug 4: Missing Props in tabProps Object

**Location:** `app/dashboard/page.tsx` tabProps object (around line 2130)

**Issue:** The new Personal Brand Strategy props are not passed to WriterTabNew.

**Fix:** Add to tabProps object:
```typescript
// In tabProps, add:
userGoal, setUserGoal, userTargetAudience, setUserTargetAudience,
userWritingStyle, setUserWritingStyle, userWritingStyleSource, setUserWritingStyleSource,
goalsLoading, goalsSuggesting, suggestGoals, saveUserGoals, loadUserGoals,
```

---

## Bug 5: Missing API Endpoint for User Goals

**Location:** Need to create `app/api/user-goals/route.ts`

**Fix:** Create the API endpoint:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    
    // Return goals from user metadata or dedicated field
    return NextResponse.json({ 
        success: true, 
        goals: { 
            goal: user.linkedinGoal || '', 
            targetAudience: user.linkedinTargetAudience || '' 
        } 
    });
}

export async function POST(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    
    const body = await request.json();
    const { goal, targetAudience } = body;
    
    await prisma.user.update({
        where: { id: payload.userId },
        data: { 
            linkedinGoal: goal || null,
            linkedinTargetAudience: targetAudience || null
        }
    });
    
    return NextResponse.json({ success: true });
}
```

**Note:** Requires adding `linkedinGoal` and `linkedinTargetAudience` fields to User model in Prisma schema.

---

## Bug 6: Missing AI Suggest Goals Endpoint

**Location:** Need to create `app/api/ai/suggest-goals/route.ts`

**Fix:** Create the API endpoint that uses AI to analyze profile and suggest goals.

---

## Summary of Required Changes

1. **page.tsx line ~651**: Change OAuth API call to extension Voyager API command
2. **page.tsx line ~124**: Add 6 new state variables for Personal Brand Strategy
3. **page.tsx line ~1382**: Add 3 new functions (suggestGoals, saveUserGoals, loadUserGoals)
4. **page.tsx tabProps**: Add the new props to be passed to WriterTabNew
5. **Create**: `app/api/user-goals/route.ts`
6. **Create**: `app/api/ai/suggest-goals/route.ts`
7. **Prisma schema**: Add `linkedinGoal` and `linkedinTargetAudience` to User model

---

## Extension Command Reference

The extension already has the `linkedin_post_via_api` command handler that:
- Posts text/image to LinkedIn using Voyager normShares API
- Supports image upload (register + upload + post)
- Updates PostDraft status if draftId provided
- Does NOT require OAuth setup
