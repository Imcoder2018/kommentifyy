// Global window extensions for Kommentify

export {};

declare global {
  interface Window {
    // LinkedIn Post functions
    getLinkedInPostContent: () => string;
    updateLinkedInPostContent: (newContent: string) => { success: boolean; content: string };
    getEditedPostContent: () => string;
    applyPostEdit: (newContent: string) => { success: boolean; originalContent: string; newContent };
    getInlineEditMode: () => boolean;
    setInlineEditMode: (enabled: boolean) => void;
    getInlineEditContent: () => string;

    // Extension communication
    linkedInProfile?: {
      name?: string;
      headline?: string;
      profilePicture?: string;
    };
    voyagerData?: {
      name?: string;
      headline?: string;
      profilePicture?: string;
      followerCount?: number;
    };

    // Toast notifications
    showToast?: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  }
}
