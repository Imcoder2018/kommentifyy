// Supabase configuration for Chrome Extension
// Replace these values with your actual Supabase project values

const SUPABASE_CONFIG = {
  url: 'https://waiyscexjomfcnrupmzt.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhaXlzY2V4am9tZmNucnVwbXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjAyOTYsImV4cCI6MjA3NDY5NjI5Nn0.NhXmRrL1LVtv6yfYj_liaUScK4KUsWAAJ1MdBys0wHk'
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SUPABASE_CONFIG;
}
