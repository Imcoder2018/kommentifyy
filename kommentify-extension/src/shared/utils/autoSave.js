/**
 * Auto-save and restore form inputs across all tabs
 * Automatically saves form state to chrome.storage.local and restores on load
 */

class AutoSaveManager {
    constructor() {
        this.storageKey = 'formInputsAutoSave';
        this.debounceDelay = 500; // 500ms delay before saving
        this.saveTimeout = null;
        this.initialized = false;
    }

    /**
     * Initialize auto-save for the current page
     */
    async initialize() {
        if (this.initialized) return;
        
        console.log('💾 AUTO-SAVE: Initializing form auto-save...');
        
        // Load saved values first
        await this.loadFormValues();
        
        // Setup auto-save listeners
        this.setupAutoSave();
        
        this.initialized = true;
        console.log('✅ AUTO-SAVE: Auto-save initialized');
    }

    /**
     * Setup event listeners for all form inputs
     */
    setupAutoSave() {
        // Get all input elements
        const inputs = document.querySelectorAll(
            'input[type="text"], input[type="email"], input[type="number"], input[type="range"], ' +
            'input[type="checkbox"], input[type="radio"], input[type="time"], ' +
            'textarea, select'
        );

        console.log(`💾 AUTO-SAVE: Found ${inputs.length} form inputs to auto-save`);

        inputs.forEach(input => {
            // Add change and input listeners
            input.addEventListener('input', () => this.debounceSave());
            input.addEventListener('change', () => this.debounceSave());
            
            // Special handling for range inputs to show real-time updates
            if (input.type === 'range') {
                input.addEventListener('input', () => this.updateRangeDisplay(input));
            }
        });
    }

    /**
     * Update display for range inputs
     */
    updateRangeDisplay(rangeInput) {
        const displayId = rangeInput.id + '-display';
        const displayElement = document.getElementById(displayId);
        if (displayElement) {
            displayElement.textContent = rangeInput.value;
        }
    }

    /**
     * Debounced save function
     */
    debounceSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        this.saveTimeout = setTimeout(() => {
            this.saveFormValues();
        }, this.debounceDelay);
    }

    /**
     * Save all form values to storage
     */
    async saveFormValues() {
        try {
            const formData = {};
            
            // Get all inputs with IDs
            const inputs = document.querySelectorAll(
                'input[id], textarea[id], select[id]'
            );

            inputs.forEach(input => {
                if (!input.id) return;
                
                let value;
                if (input.type === 'checkbox' || input.type === 'radio') {
                    value = input.checked;
                } else {
                    value = input.value;
                }
                
                formData[input.id] = {
                    value: value,
                    type: input.type,
                    tagName: input.tagName.toLowerCase()
                };
            });

            // Get existing data and update
            const { formInputsAutoSave = {} } = await chrome.storage.local.get('formInputsAutoSave');
            
            // Store by current page URL or a general key
            const pageKey = window.location.pathname || 'extension';
            formInputsAutoSave[pageKey] = formData;
            
            await chrome.storage.local.set({ formInputsAutoSave });
            
            console.log(`💾 AUTO-SAVE: Saved ${Object.keys(formData).length} form values`);
            
        } catch (error) {
            console.error('💾 AUTO-SAVE: Failed to save form values:', error);
        }
    }

    /**
     * Load and restore form values from storage
     */
    async loadFormValues() {
        try {
            const { formInputsAutoSave = {} } = await chrome.storage.local.get('formInputsAutoSave');
            
            const pageKey = window.location.pathname || 'extension';
            const formData = formInputsAutoSave[pageKey];
            
            if (!formData) {
                console.log('💾 AUTO-SAVE: No saved form values found');
                return;
            }
            
            let restoredCount = 0;
            
            Object.entries(formData).forEach(([inputId, inputData]) => {
                const input = document.getElementById(inputId);
                if (!input) return;
                
                try {
                    if (input.type === 'checkbox' || input.type === 'radio') {
                        input.checked = inputData.value;
                    } else {
                        input.value = inputData.value;
                    }
                    
                    // Update range displays
                    if (input.type === 'range') {
                        this.updateRangeDisplay(input);
                    }
                    
                    // Trigger change event to update any dependent UI
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    restoredCount++;
                } catch (error) {
                    console.warn(`💾 AUTO-SAVE: Failed to restore value for ${inputId}:`, error);
                }
            });
            
            console.log(`💾 AUTO-SAVE: Restored ${restoredCount} form values`);
            
        } catch (error) {
            console.error('💾 AUTO-SAVE: Failed to load form values:', error);
        }
    }

    /**
     * Clear saved form values
     */
    async clearSavedValues() {
        try {
            const pageKey = window.location.pathname || 'extension';
            const { formInputsAutoSave = {} } = await chrome.storage.local.get('formInputsAutoSave');
            
            delete formInputsAutoSave[pageKey];
            await chrome.storage.local.set({ formInputsAutoSave });
            
            console.log('💾 AUTO-SAVE: Cleared saved form values');
        } catch (error) {
            console.error('💾 AUTO-SAVE: Failed to clear saved values:', error);
        }
    }

    /**
     * Reset all form inputs to default values
     */
    resetFormToDefaults() {
        const inputs = document.querySelectorAll(
            'input[id], textarea[id], select[id]'
        );

        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = input.defaultChecked;
            } else {
                input.value = input.defaultValue;
            }
            
            // Update range displays
            if (input.type === 'range') {
                this.updateRangeDisplay(input);
            }
            
            // Trigger change event
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
        
        // Clear saved values
        this.clearSavedValues();
        
        console.log('💾 AUTO-SAVE: Reset all forms to defaults');
    }
}

// Create global instance
window.autoSaveManager = new AutoSaveManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.autoSaveManager.initialize(), 100);
    });
} else {
    setTimeout(() => window.autoSaveManager.initialize(), 100);
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoSaveManager;
}
