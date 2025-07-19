// PWA Utility Functions

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Check if PWA is installable
export const isPWAInstallable = (): boolean => {
  // Check for basic PWA support
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasBeforeInstallPrompt = 'BeforeInstallPromptEvent' in window;
  const hasManifest = !!document.querySelector('link[rel="manifest"]');
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  console.log('PWA Support Check:', {
    hasServiceWorker,
    hasBeforeInstallPrompt,
    hasManifest,
    isMobile,
    isChrome,
    isStandalone,
    userAgent: navigator.userAgent,
    displayMode: window.matchMedia('(display-mode: standalone)').matches,
    standalone: (window.navigator as any).standalone
  });
  
  // For mobile Chrome, we need service worker and manifest
  // For desktop, we also need the beforeinstallprompt event
  if (isMobile && isChrome) {
    return hasServiceWorker && hasManifest && !isStandalone;
  }
  
  return hasServiceWorker && hasManifest;
};

// Check if PWA is already installed
export const isPWAInstalled = (): boolean => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = (window.navigator as any).standalone === true;
  const isAndroidStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  console.log('PWA Installation Check:', {
    isStandalone,
    isIOSStandalone,
    isAndroidStandalone,
    displayMode: window.matchMedia('(display-mode: standalone)').matches,
    userAgent: navigator.userAgent
  });
  
  return isStandalone || isIOSStandalone || isAndroidStandalone;
};

// Get PWA install prompt
export const getPWAInstallPrompt = (): PWAInstallPrompt | null => {
  const prompt = (window as any).deferredPrompt;
  console.log('PWA Install Prompt:', {
    hasPrompt: !!prompt,
    promptType: prompt ? prompt.constructor.name : 'none'
  });
  return prompt || null;
};

// Check if install prompt is available (more detailed)
export const canShowInstallPrompt = (): boolean => {
  const prompt = getPWAInstallPrompt();
  const notInstalled = !isPWAInstalled();
  const hasBasicSupport = isPWAInstallable();
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
  
  console.log('Can Show Install Prompt:', {
    hasPrompt: !!prompt,
    notInstalled,
    hasBasicSupport,
    isMobile,
    isChrome,
    result: !!prompt && notInstalled && hasBasicSupport
  });
  
  // For mobile Chrome, we might not need the beforeinstallprompt event
  // as Chrome can show the install banner automatically
  if (isMobile && isChrome) {
    return notInstalled && hasBasicSupport;
  }
  
  return !!prompt && notInstalled && hasBasicSupport;
};

// Clear PWA install prompt
export const clearPWAInstallPrompt = (): void => {
  (window as any).deferredPrompt = null;
};

// Install PWA
export const installPWA = async (): Promise<boolean> => {
  const prompt = getPWAInstallPrompt();
  if (!prompt) {
    console.log('No install prompt available');
    return false;
  }

  try {
    await prompt.prompt();
    const choiceResult = await prompt.userChoice;
    clearPWAInstallPrompt();
    
    if (choiceResult.outcome === 'accepted') {
      console.log('PWA installed successfully');
      return true;
    } else {
      console.log('PWA installation dismissed');
      return false;
    }
  } catch (error) {
    console.error('Error installing PWA:', error);
    return false;
  }
};

// Check for app updates
export const checkForUpdates = (): void => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.update();
    });
  }
};

// Handle service worker updates
export const handleSWUpdate = (registration: ServiceWorkerRegistration): void => {
  const newWorker = registration.waiting;
  
  if (newWorker) {
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New version available
        showUpdateNotification();
      }
    });
  }
};

// Show update notification
export const showUpdateNotification = (): void => {
  // You can implement a custom update notification UI here
  if (confirm('A new version is available! Would you like to update?')) {
    updateApp();
  }
};

// Update the app
export const updateApp = (): void => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });
  }
};

// Reload the page after update
export const reloadAfterUpdate = (): void => {
  window.location.reload();
};

// Initialize PWA features
export const initializePWA = (): void => {
  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as any).deferredPrompt = e;
    console.log('PWA install prompt ready');
  });

  // Listen for appinstalled event
  window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    clearPWAInstallPrompt();
  });

  // Listen for service worker updates
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('New service worker activated');
      // Optionally reload the page to use the new service worker
      // reloadAfterUpdate();
    });
  }
};

// Offline/Online status
export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const onOnlineStatusChange = (callback: (online: boolean) => void): void => {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
};

// Local storage utilities for offline data
export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

// Sync data when coming back online
export const syncOfflineData = (): void => {
  // Implement data synchronization logic here
  console.log('Syncing offline data...');
}; 

// Check service worker registration status
export const checkServiceWorkerStatus = async (): Promise<any> => {
  if (!('serviceWorker' in navigator)) {
    return { registered: false, error: 'Service Worker not supported' };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    const sw = registration?.active;
    
    const status = {
      registered: !!registration,
      active: !!sw,
      state: sw?.state || 'none',
      scriptURL: sw?.scriptURL || 'none',
      scope: registration?.scope || 'none'
    };
    
    console.log('Service Worker Status:', status);
    return status;
  } catch (error) {
    console.error('Error checking service worker:', error);
    return { registered: false, error: (error as Error).message };
  }
};

// Force service worker registration (for debugging)
export const forceServiceWorkerRegistration = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    console.log('Service Worker registered successfully:', registration);
    return true;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return false;
  }
}; 