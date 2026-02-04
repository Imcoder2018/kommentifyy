/**
 * Keys used for chrome.storage.local.
 */
export const StorageKey = {
    AutomationPageState: "AutomationPageState",
    AutomationPageUrns: "AutomationPageUrns",
    AutomationListState: "AutomationListState",
    AutomationListActivityUrls: "AutomationListActivityUrls",
    AutomationQuota: "AutomationQuota",
    AutomationPostAgeLimit: "AutomationPostAgeLimit",
    AutomationSoundState: "AutomationSoundState",
    AutomationCompleteMessage: "AutomationCompleteMessage",
};

/**
 * Data attributes used to mark elements processed by the extension.
 */
export const DataAttribute = {
    DynamicHiddenIFrame: "data-rocket-dynamic-hidden-iframe",
    DynamicSpinnerImage: "data-rocket-dynamic-spinner-image",
    AlreadyRegistered: "data-rocket-already-registered",
    AlreadyCollected: "data-rocket-already-collected",
    IsAutomation: "data-rocket-is-automation",
};

/**
 * Simple On/Off states.
 */
export const SwitchState = {
    On: "On",
    Off: "Off",
};

/**
 * Types of user engagement.
 */
export const EngagementType = {
    Comment: "Comment",
    Reply: "Reply",
};

/**
 * User-facing error messages.
 */
export const ErrorText = {
    ExtensionContextInvalidated: "Extension context invalidated.",
    YourFreeTrialHasExpired: "Your free trial has expired",
    YouHaveReachedTheMaximumUsageAllowed: "You have reached the maximum usage allowed",
    YouHaveAlreadyEngaged: "You have already engaged",
};

/**
 * Enums for user preferences.
 */
export const CommentLength = {
    SuperShort: "SuperShort",
    Brief: "Brief",
    Concise: "Concise",
    InLength: "In-Length",
    MultiParagraph: "Multi-Paragraph"
};

export const Tone = {
    Supportive: "Supportive",
    Gracious: "Gracious",
    Witty: "Witty",
    Polite: "Polite",
    // ... add all other tones
};

export const PostAge = {
    NotSpecified: "NotSpecified",
    OneDay: "OneDay",
    ThreeDays: "ThreeDays",
    OneWeek: "OneWeek",
    OneMonth: "OneMonth",
    ThreeMonths: "ThreeMonths"
};
