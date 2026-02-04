import { storage } from '../shared/storage/storage.js';
import { toast } from '../shared/utils/toaster.js';
import { sounds } from '../shared/utils/sounds.js';
import * as T from '../shared/storage/constants.js';

class Alerts {
    /**
     * Checks storage for a completion message from an automation job.
     * If found, displays it as a toast and plays a sound, then clears the message.
     */
    async outputAutomationAlertsIfNeeded() {
        const message = await storage.getString(T.StorageKey.AutomationCompleteMessage);
        if (!message) {
            return;
        }

        toast.success(message, 'Auto-Pilot Complete');
        
        const soundState = await storage.getEnum(T.StorageKey.AutomationSoundState);
        if (soundState === T.SwitchState.On) {
            sounds.success();
        }
        
        // Clear the message from storage so it's not shown again.
        await storage.remove(T.StorageKey.AutomationCompleteMessage);
    }
}

export const alerts = new Alerts();
