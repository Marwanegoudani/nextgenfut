'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { loadGoogleMapsApi, getGoogleMapsApiStatus } from '@/lib/google-maps';

export function MapTest() {
  const [apiStatus, setApiStatus] = useState<{
    loaded: boolean;
    error: string | null;
    placesAvailable: boolean;
  }>({
    loaded: false,
    error: null,
    placesAvailable: false,
  });

  const [searchResult, setSearchResult] = useState<string | null>(null);

  useEffect(() => {
    // Test if API key is configured
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setApiStatus(prev => ({
        ...prev,
        error: 'API key not found in environment variables'
      }));
      return;
    }

    // Load Google Maps API
    loadGoogleMapsApi()
      .then(() => {
        setApiStatus({
          loaded: true,
          error: null,
          placesAvailable: !!window.google?.maps?.places
        });
      })
      .catch((error: unknown) => {
        setApiStatus({
          loaded: false,
          error: error instanceof Error ? error.message : 'Failed to load Google Maps API',
          placesAvailable: false
        });
      });
  }, []);

  const testPlacesAPI = async () => {
    if (!window.google?.maps?.places) {
      setSearchResult('Places API not available');
      return;
    }

    try {
      const service = new google.maps.places.AutocompleteService();
      const results = await new Promise((resolve, reject) => {
        service.getPlacePredictions(
          {
            input: 'Paris',
            componentRestrictions: { country: 'FR' },
          },
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              resolve(predictions);
            } else {
              reject(new Error(`Places API error: ${status}`));
            }
          }
        );
      });

      setSearchResult(JSON.stringify(results, null, 2));
    } catch (error) {
      setSearchResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Google Maps API Test</h2>
        
        <div className="space-y-1">
          <p>API Key: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? '✅ Present' : '❌ Missing'}</p>
          <p>API Loaded: {apiStatus.loaded ? '✅' : '❌'}</p>
          <p>Places API Available: {apiStatus.placesAvailable ? '✅' : '❌'}</p>
          {apiStatus.error && (
            <p className="text-red-500">Error: {apiStatus.error}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Button 
          onClick={testPlacesAPI}
          disabled={!apiStatus.placesAvailable}
        >
          Test Places API
        </Button>

        {searchResult && (
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
            {searchResult}
          </pre>
        )}
      </div>
    </div>
  );
} 