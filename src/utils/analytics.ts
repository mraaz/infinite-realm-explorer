// Google Analytics 4 utility functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const GA_MEASUREMENT_ID = 'G-R27QR2D9VJ';
const isDev = import.meta.env.DEV;

// Initialize GA4 (already done in index.html, but this ensures proper typing)
export const initGA = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    if (isDev) {
      console.log('[Analytics] GA4 initialized in development mode');
    }
  }
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title,
    });
    
    if (isDev) {
      console.log('[Analytics] Page view tracked:', { path, title });
    }
  }
};

// Track custom events
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      debug_mode: isDev,
    });
    
    if (isDev) {
      console.log('[Analytics] Event tracked:', eventName, parameters);
    }
  }
};

// Predefined event tracking functions
export const trackLogin = (method: 'google' | 'discord' | 'facebook') => {
  trackEvent('login', {
    method,
  });
};

export const trackLogout = () => {
  trackEvent('logout');
};

export const trackSignUp = (method: 'google' | 'discord' | 'facebook') => {
  trackEvent('sign_up', {
    method,
  });
};

export const trackQuestionnaireStart = (type: 'onboarding' | 'future' | 'pulse') => {
  trackEvent('questionnaire_start', {
    questionnaire_type: type,
  });
};

export const trackQuestionnaireComplete = (type: 'onboarding' | 'future' | 'pulse') => {
  trackEvent('questionnaire_complete', {
    questionnaire_type: type,
  });
};

export const trackHabitCreated = () => {
  trackEvent('habit_created');
};

export const trackResultsViewed = () => {
  trackEvent('results_viewed');
};

export const trackResultsShared = () => {
  trackEvent('share', {
    content_type: 'results',
  });
};

export const trackPdfDownload = () => {
  trackEvent('file_download', {
    file_type: 'pdf',
    content_type: 'results',
  });
};

// Set user properties
export const setUserProperty = (property: string, value: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      user_properties: {
        [property]: value,
      },
    });
    
    if (isDev) {
      console.log('[Analytics] User property set:', property, value);
    }
  }
};