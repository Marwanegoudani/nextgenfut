let isLoading = false;
let isLoaded = false;
let loadError: Error | null = null;
let loadPromise: Promise<void> | null = null;

export function loadGoogleMapsApi(): Promise<void> {
  if (isLoaded) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error('Google Maps API key not found'));
  }

  isLoading = true;
  loadPromise = new Promise((resolve, reject) => {
    // Check if the API is already loaded
    if (window.google?.maps) {
      isLoaded = true;
      isLoading = false;
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    // Setup load handler
    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      loadError = null;
      resolve();
    };

    // Setup error handler
    script.onerror = () => {
      isLoading = false;
      loadError = new Error('Failed to load Google Maps API');
      document.head.removeChild(script);
      reject(loadError);
    };

    // Add script to document
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function getGoogleMapsApiStatus() {
  return {
    isLoading,
    isLoaded,
    error: loadError,
  };
} 