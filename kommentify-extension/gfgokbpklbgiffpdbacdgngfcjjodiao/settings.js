// settings.js - Handles user profile settings

// authManager is already declared in auth.js as a global singleton
// supabaseClient will be initialized in DOMContentLoaded
var supabaseClient;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Settings page loaded');
  
  try {
    // Check if authManager exists (should be loaded from auth.js)
    if (typeof authManager === 'undefined') {
      throw new Error('AuthManager not loaded. Please ensure auth.js is loaded before settings.js');
    }
    
    // authManager is already initialized as a singleton in auth.js
    // Just ensure it's initialized
    if (!authManager.initialized) {
      console.log('Initializing authManager...');
      await authManager.init();
    }
    
    // Get user
    const user = authManager.getUser();
    
    if (!user) {
      console.error('No user found, redirecting...');
      showError('Please sign in to access settings');
      setTimeout(() => {
        window.close();
      }, 2000);
      return;
    }
    
    console.log('User authenticated:', user.email);
    
    // Check if Supabase is loaded
    if (typeof supabase === 'undefined') {
      throw new Error('Supabase library not loaded. Please ensure supabase.js is included.');
    }
    
    // Check if config is available
    if (typeof SUPABASE_CONFIG === 'undefined') {
      throw new Error('SUPABASE_CONFIG not found. Please ensure config.js is loaded.');
    }
    
    // Initialize Supabase client
    const { createClient } = supabase;
    supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    
    // Set auth token
    const token = await authManager.getAccessToken();
    const refreshToken = await authManager.getRefreshToken();
    if (token && refreshToken) {
      supabaseClient.auth.setSession({
        access_token: token,
        refresh_token: refreshToken
      });
    }
    
    // Load existing profile
    await loadProfile(user.id);
    
    // Setup event listeners
    setupEventListeners();
  } catch (error) {
    console.error('Error initializing settings page:', error);
    console.error('Error stack:', error.stack);
    showError(`Failed to initialize settings: ${error.message || 'Please try again.'}`);
  }
});

// Load user profile from database
async function loadProfile(userId) {
  try {
    showLoading(true);
    
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows" error
      console.error('Error loading profile:', error);
      throw error;
    }
    
    if (data) {
      console.log('Profile loaded successfully:', data);
      populateForm(data);
    } else {
      console.log('No existing profile found - form will start empty');
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    showError('Failed to load profile data. Please try again.');
  } finally {
    showLoading(false);
  }
}

// Populate form with existing data
function populateForm(data) {
  // Use 'name' field for consistency with the save function
  document.getElementById('fullName').value = data.name || '';
  document.getElementById('jobTitle').value = data.job_title || '';
  document.getElementById('company').value = data.company || '';
  document.getElementById('expertise').value = data.expertise || '';
  document.getElementById('yearsOfExperience').value = data.years_of_experience || '';
  document.getElementById('useEmojis').checked = data.use_emojis ?? false;
  document.getElementById('askQuestions').checked = data.ask_questions ?? false;
  document.getElementById('additionalInfo').value = data.additional_info || '';
  
  // Set tone and length values
  const commentTone = data.comment_tone || 'professional';
  const commentLength = data.comment_length || 'short';
  
  document.getElementById('commentTone').value = commentTone;
  document.getElementById('commentLength').value = commentLength;
  
  // Set active state on toggle buttons
  setActiveToggleButton('tone', commentTone);
  setActiveToggleButton('length', commentLength);
}

// Set active state on a toggle button group
function setActiveToggleButton(group, value) {
  // Remove active class from all buttons in the group
  const groupButtons = document.querySelectorAll(`[data-group="${group}"]`);
  groupButtons.forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });
  
  // Add active class to the button with matching value
  const activeButton = document.querySelector(`[data-group="${group}"][data-value="${value}"]`);
  if (activeButton) {
    activeButton.classList.add('active');
    activeButton.setAttribute('aria-pressed', 'true');
  }
}

// Setup event listeners
function setupEventListeners() {
  const form = document.getElementById('profileForm');
  const cancelBtn = document.getElementById('cancelBtn');
  
  form.addEventListener('submit', handleSubmit);
  cancelBtn.addEventListener('click', () => window.close());
  
  // Setup toggle button handlers
  setupToggleButtons();
}

// Setup toggle button functionality
function setupToggleButtons() {
  const toggleButtons = document.querySelectorAll('.toggle-btn');
  
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const group = this.getAttribute('data-group');
      const value = this.getAttribute('data-value');
      
      // Remove active class from all buttons in the same group
      const groupButtons = document.querySelectorAll(`[data-group="${group}"]`);
      groupButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      
      // Add active class to clicked button
      this.classList.add('active');
      this.setAttribute('aria-pressed', 'true');
      
      // Update the hidden input value
      if (group === 'tone') {
        document.getElementById('commentTone').value = value;
      } else if (group === 'length') {
        document.getElementById('commentLength').value = value;
      }
    });
  });
}

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();
  
  try {
    const user = authManager.getUser();
    if (!user) {
      showError('Please sign in to save your profile');
      return;
    }
    
    // Get form data
    const fullName = document.getElementById('fullName').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const company = document.getElementById('company').value.trim();
    const expertise = document.getElementById('expertise').value.trim();
    const yearsOfExperience = document.getElementById('yearsOfExperience').value;
    
    // Basic validation
    if (fullName && fullName.length > 100) {
      showError('Full name must be less than 100 characters');
      return;
    }
    
    if (jobTitle && jobTitle.length > 100) {
      showError('Job title must be less than 100 characters');
      return;
    }
    
    if (company && company.length > 100) {
      showError('Company name must be less than 100 characters');
      return;
    }
    
    if (expertise && expertise.length > 500) {
      showError('Expertise must be less than 500 characters');
      return;
    }
    
    if (yearsOfExperience && (parseInt(yearsOfExperience) < 0 || parseInt(yearsOfExperience) > 100)) {
      showError('Years of experience must be between 0 and 100');
      return;
    }
    
    const additionalInfo = document.getElementById('additionalInfo').value.trim();
    if (additionalInfo && additionalInfo.length > 1000) {
      showError('Additional information must be less than 1000 characters');
      return;
    }
    
    const formData = {
      id: user.id,
      email: user.email,
      name: fullName,
      job_title: jobTitle,
      company: company,
      expertise: expertise,
      years_of_experience: yearsOfExperience,
      comment_tone: document.getElementById('commentTone').value,
      comment_length: document.getElementById('commentLength').value,
      use_emojis: document.getElementById('useEmojis').checked,
      ask_questions: document.getElementById('askQuestions').checked,
      additional_info: additionalInfo,
      updated_at: new Date().toISOString()
    };
    
    console.log('Saving profile:', formData);
    
    // Show saving state
    setSavingState(true);
    
    // Upsert profile (insert or update)
    const { data, error } = await supabaseClient
      .from('users')
      .upsert(formData, {
        onConflict: 'id'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('Profile saved successfully:', data);
    
    // Cache the settings locally for quick access
    const userSettings = {
      tone: formData.comment_tone,
      length: formData.comment_length,
      useEmojis: formData.use_emojis,
      askQuestions: formData.ask_questions,
      usePersonalization: true
    };
    
    await chrome.storage.local.set({ userSettings });
    console.log('User settings cached locally:', userSettings);
    
    showSuccess('Profile saved successfully!');
    
    // // Close window after a short delay
    // setTimeout(() => {
    //   window.close();
    // }, 1500);
    
  } catch (error) {
    console.error('Error saving profile:', error);
    showError(`Failed to save profile: ${error.message}`);
  } finally {
    setSavingState(false);
  }
}

// Show/hide loading overlay
function showLoading(show) {
  const overlay = document.getElementById('loadingOverlay');
  if (show) {
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
  }
}

// Set saving state
function setSavingState(saving) {
  const saveBtn = document.getElementById('submitBtn');
  
  if (saving) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
  } else {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Profile';
  }
}

// Show error message
function showError(message) {
  const errorEl = document.getElementById('errorMessage');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
  
  // Hide after 5 seconds
  setTimeout(() => {
    errorEl.classList.add('hidden');
  }, 5000);
}

// Show success message
function showSuccess(message) {
  const successEl = document.getElementById('successMessage');
  successEl.textContent = message;
  successEl.classList.remove('hidden');
  
  // Hide after 3 seconds
  setTimeout(() => {
    successEl.classList.add('hidden');
  }, 3000);
}
