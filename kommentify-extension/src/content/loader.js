/**
 * FINAL LOADER SCRIPT
 * This script fixes the race condition by loading dependencies sequentially.
 * It waits for each library to finish loading before injecting the next,
 * guaranteeing that `axios` and `iziToast` are available before our main app runs.
 */
(function() {
    const injectCss = (filePath) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = chrome.runtime.getURL(filePath);
        (document.head || document.documentElement).appendChild(link);
    };

    /**
     * Injects a script and executes a callback function only after the script has fully loaded.
     * @param {string} filePath - The path to the script file.
     * @param {function} callback - The function to execute upon successful loading.
     * @param {boolean} isModule - Whether the script should be treated as a module.
     */
    const injectScriptSequentially = (filePath, callback, isModule = false) => {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL(filePath);
        if (isModule) {
            script.type = 'module';
        }
        // Set the callback to run when the script is loaded
        script.onload = callback;
        // Handle potential loading errors
        script.onerror = (e) => console.error(`[AutoEngagerLoader] Error loading script: ${filePath}`, e);
        (document.head || document.documentElement).appendChild(script);
    };

    console.log('[AutoEngagerLoader] Starting injection sequence...');

    try {
        // CSS can be injected immediately as it doesn't block script execution.
        injectCss('assets/css/iziToast.min.css');

        // Step 1: Inject Axios. When it finishes, the callback will run.
        injectScriptSequentially('assets/lib/axios.min.js', () => {
            console.log('[AutoEngagerLoader] SUCCESS: axios.min.js has loaded.');

            // Step 2: Axios is ready. Now inject iziToast.
            injectScriptSequentially('assets/lib/iziToast.min.js', () => {
                console.log('[AutoEngagerLoader] SUCCESS: iziToast.min.js has loaded.');

                // Step 3: Both libraries are ready. Now inject our main application module.
                injectScriptSequentially('content/index.js', () => {
                    console.log('[AutoEngagerLoader] SUCCESS: Main app (index.js) has loaded.');
                }, true);
            });
        });

    } catch (e) {
        console.error('[AutoEngagerLoader] Critical error during injection setup:', e);
    }
})();