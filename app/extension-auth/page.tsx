'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function ExtensionAuthPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to extension...');

  useEffect(() => {
    async function fetchTokenAndSendToExtension() {
      if (!isLoaded) return;
      
      if (!isSignedIn) {
        setStatus('error');
        setMessage('Please sign in first');
        // Redirect to sign-in
        window.location.href = '/sign-in?redirect_url=' + encodeURIComponent(window.location.href);
        return;
      }

      try {
        setMessage('Fetching authentication token...');
        
        // Fetch the token from our API (same-origin, cookies included automatically)
        const response = await fetch('/api/auth/extension-token', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (data.success && data.authToken) {
          setMessage('Sending credentials to extension...');
          
          // Store data in a hidden element for content script to read
          const authDataElement = document.createElement('div');
          authDataElement.id = 'kommentify-extension-auth-data';
          authDataElement.style.display = 'none';
          authDataElement.setAttribute('data-auth', JSON.stringify({
            authToken: data.authToken,
            refreshToken: data.refreshToken,
            userData: data.userData,
            apiBaseUrl: data.apiBaseUrl,
          }));
          document.body.appendChild(authDataElement);

          // Also dispatch a custom event for the content script
          window.dispatchEvent(new CustomEvent('kommentify-auth-ready', {
            detail: {
              authToken: data.authToken,
              refreshToken: data.refreshToken,
              userData: data.userData,
              apiBaseUrl: data.apiBaseUrl,
            }
          }));

          setStatus('success');
          setMessage('Success! You can close this tab and return to the extension.');
          
          // Auto-close after a short delay
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          throw new Error(data.error || 'Failed to get token');
        }
      } catch (error) {
        console.error('Extension auth error:', error);
        setStatus('error');
        setMessage('Failed to authenticate. Please try again.');
      }
    }

    fetchTokenAndSendToExtension();
  }, [isLoaded, isSignedIn, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-800">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
          )}
          {status === 'success' && (
            <div className="text-6xl">✅</div>
          )}
          {status === 'error' && (
            <div className="text-6xl">❌</div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {status === 'loading' && 'Connecting Extension...'}
          {status === 'success' && 'Connected!'}
          {status === 'error' && 'Connection Failed'}
        </h1>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        {status === 'success' && (
          <p className="text-sm text-gray-500">
            This tab will close automatically...
          </p>
        )}
        
        {status === 'error' && (
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
