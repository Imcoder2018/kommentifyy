/**
 * DEFINITIVE PROFILE SCRAPER
 * Injected into the user's main profile page to get profile data reliably.
 */
export const profileScraper = async () => {
    const waitForElement = (selector, timeout = 7000) => {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                const element = document.querySelector(selector);
                if (element) { clearInterval(interval); resolve(element); }
            }, 100);
            setTimeout(() => { clearInterval(interval); resolve(null); }, timeout);
        });
    };

    // Get the 'seat' (profile ID) directly from the current URL. This is foolproof.
    const url = window.location.href;
    const match = url.match(/\/in\/([^\/\?]+)/);
    const seat = match ? match[1] : null;

    if (!seat) { return null; }

    // Get the name and image from the main profile picture element.
    const profileImageEl = await waitForElement("img.pv-top-card-profile-picture__image, .profile-photo-edit__preview");
    if (!profileImageEl) { return null; }

    const me = profileImageEl.alt;
    const imageUrl = profileImageEl.src;
    
    return { seat, me, imageUrl };
};