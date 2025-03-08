'use client';

import { useEffect, useRef, useState } from 'react';
import { Match } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { loadGoogleMapsApi } from '@/lib/google-maps';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { MatchCard } from '@/components/matches/MatchCard';

interface MatchMapViewProps {
  matches: Match[];
  onJoinMatch: (matchId: string, team: 'home' | 'away') => void;
  onViewDetails: (matchId: string) => void;
}

export function MatchMapView({ matches, onJoinMatch, onViewDetails }: MatchMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [radius, setRadius] = useState<number>(10); // Default 10km radius
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);

  // Load Google Maps API and initialize map
  useEffect(() => {
    loadGoogleMapsApi()
      .then(() => {
        if (mapRef.current && !googleMapRef.current) {
          // Default to Paris, France if no user location
          const defaultLocation = { lat: 48.8566, lng: 2.3522 };
          
          // Create the map
          const map = new google.maps.Map(mapRef.current, {
            center: userLocation || defaultLocation,
            zoom: 12,
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
          });
          
          googleMapRef.current = map;
          infoWindowRef.current = new google.maps.InfoWindow();
          
          // Try to get user's location
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const userPos = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                };
                setUserLocation(userPos);
                map.setCenter(userPos);
                
                // Add user marker
                new google.maps.Marker({
                  position: userPos,
                  map,
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#4285F4',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                  },
                  title: 'Your Location',
                });
              },
              () => {
                setError('Unable to get your location. Using default location.');
              }
            );
          }
          
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load Google Maps:', err);
        setError('Failed to load map. Please try again later.');
        setLoading(false);
      });
      
    return () => {
      // Clean up markers when component unmounts
      if (markersRef.current) {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
      }
    };
  }, []);
  
  // Filter matches by distance when user location or radius changes
  useEffect(() => {
    if (!userLocation) {
      setFilteredMatches(matches);
      return;
    }
    
    const filtered = matches.filter(match => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        match.location.coordinates.latitude,
        match.location.coordinates.longitude
      );
      return distance <= radius;
    });
    
    setFilteredMatches(filtered);
  }, [matches, userLocation, radius]);
  
  // Update markers when filtered matches change
  useEffect(() => {
    if (!googleMapRef.current) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Add markers for each match
    filteredMatches.forEach(match => {
      const marker = new google.maps.Marker({
        position: {
          lat: match.location.coordinates.latitude,
          lng: match.location.coordinates.longitude,
        },
        map: googleMapRef.current,
        title: match.location.name,
        animation: google.maps.Animation.DROP,
      });
      
      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
          
          // Create info window content
          const contentString = `
            <div class="p-2">
              <h3 class="font-bold">${match.location.name}</h3>
              <p>${match.location.address}</p>
              <p>${new Date(match.date).toLocaleString()}</p>
            </div>
          `;
          
          infoWindowRef.current.setContent(contentString);
          infoWindowRef.current.open(googleMapRef.current, marker);
          setSelectedMatch(match);
        }
      });
      
      markersRef.current.push(marker);
    });
  }, [filteredMatches]);
  
  // Calculate distance between two coordinates in kilometers (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  
  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };
  
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userPos);
          
          if (googleMapRef.current) {
            googleMapRef.current.setCenter(userPos);
            googleMapRef.current.setZoom(13);
          }
          
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to get your location. Please check your browser settings.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Button 
          onClick={handleGetCurrentLocation}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Navigation className="h-4 w-4" />
          Use My Location
        </Button>
        
        <div className="flex items-center gap-2 flex-1">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm whitespace-nowrap">Distance: {radius} km</span>
          <div className="w-full max-w-xs">
            <Slider
              value={[radius]}
              min={1}
              max={50}
              step={1}
              onValueChange={(value: number[]) => setRadius(value[0])}
            />
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          {filteredMatches.length} matches found
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        <div className="md:col-span-2 relative rounded-lg overflow-hidden border border-gray-200">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
              <div className="text-center p-4">
                <p className="text-red-500 mb-2">{error}</p>
                <Button onClick={() => setError(null)}>Dismiss</Button>
              </div>
            </div>
          )}
          
          <div ref={mapRef} className="w-full h-full" />
        </div>
        
        <div className="overflow-y-auto pr-2 space-y-4">
          {selectedMatch ? (
            <div className="space-y-4">
              <MatchCard
                match={selectedMatch}
                onJoin={(team) => onJoinMatch(selectedMatch.id, team)}
                onViewDetails={() => onViewDetails(selectedMatch.id)}
              />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setSelectedMatch(null)}
              >
                Back to list
              </Button>
            </div>
          ) : filteredMatches.length > 0 ? (
            filteredMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                onJoin={(team) => onJoinMatch(match.id, team)}
                onViewDetails={() => onViewDetails(match.id)}
              />
            ))
          ) : (
            <Card className="p-6 text-center text-gray-500">
              No matches found in this area. Try increasing the distance or changing your location.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 