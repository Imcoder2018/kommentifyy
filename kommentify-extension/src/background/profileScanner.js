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

            console.log("PROFILE SCANNER: Step 4 - Saving to database...");
            const savedData = await this.saveToDatabase(profileUrl, profileData);

            this.isScanning = false;
            return { success: true, data: savedData };

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
                    const data = {
                        name: "",
                        headline: "",
                        about: "",
                        posts: [],
                        experience: [],
                        education: [],
                        certifications: [],
                        projects: [],
                        skills: [],
                        language: ""
                    };

                    function clean(text) {
                        if (!text) return "";
                        return text.replace(/\.\.\.\s*more$/i, "")
                                   .replace(/Show all/gi, "")
                                   .replace(/See more/gi, "")
                                   .replace(/\s+/g, " ")
                                   .trim();
                    }

                    function autoScrollFn() {
                        let count = 0;
                        const maxScrolls = 50;
                        const timer = setInterval(() => {
                            window.scrollBy(0, 500);
                            count++;
                            if (count >= maxScrolls) {
                                clearInterval(timer);
                            }
                        }, 800);
                    }

                    autoScrollFn();

                    const nameEl = document.querySelector('h2._2cda7f44._00316ad5') || document.querySelector('h2');
                    if (nameEl) {
                        data.name = clean(nameEl.innerText);
                        const topCard = nameEl.closest('section') || nameEl.closest('div.d9511fd4');
                        if (topCard) {
                            const headlineEl = topCard.querySelector('p.f53b12a2');
                            if (headlineEl && headlineEl !== nameEl) {
                                data.headline = clean(headlineEl.innerText);
                            }
                        }
                    }

                    const aboutEl = document.querySelector('[data-testid="expandable-text-box"]');
                    if (aboutEl) {
                        data.about = clean(aboutEl.innerText);
                    }

                    const skillsHeader = Array.from(document.querySelectorAll('h2, span')).find(h => h.innerText.trim() === "Skills");
                    if (skillsHeader) {
                        const skillsSection = skillsHeader.closest('section') || skillsHeader.closest('div.e574b0ac');
                        if (skillsSection) {
                            const items = skillsSection.querySelectorAll('[componentkey*="profile.skill"]');
                            items.forEach(item => {
                                const txt = clean(item.innerText);
                                if (txt) data.skills.push(txt);
                            });
                        }
                    }

                    const expHeader = Array.from(document.querySelectorAll('h2, span')).find(h => h.innerText.includes("Experience"));
                    if (expHeader) {
                        const expSection = expHeader.closest('section') || expHeader.parentElement.parentElement;
                        if (expSection) {
                            const items = expSection.querySelectorAll('li, .pvs-list__item--line-separated');
                            items.forEach(item => {
                                const txt = clean(item.innerText);
                                if (txt && txt.length > 20) {
                                    data.experience.push(txt.substring(0, 300));
                                }
                            });
                        }
                    }

                    const postEls = document.querySelectorAll('[data-view-name="feed-commentary"]');
                    postEls.forEach(el => {
                        const txt = clean(el.innerText);
                        if (txt && txt.length > 50) {
                            data.posts.push(txt.substring(0, 500));
                        }
                    });

                    return data;
                }
            });

            await new Promise(resolve => setTimeout(resolve, 5000));
            return result[0]?.result || {};
        } catch (error) {
            console.error("PROFILE SCANNER: Error extracting profile data:", error);
            return {};
        }
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
                    about: profileData.about,
                    language: profileData.language,
                    posts: profileData.posts || [],
                    experience: profileData.experience || [],
                    education: profileData.education || [],
                    certifications: profileData.certifications || [],
                    projects: profileData.projects || [],
                    skills: profileData.skills || [],
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
