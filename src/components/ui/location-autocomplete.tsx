'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from './input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './custom-command';
import { Popover, PopoverContent, PopoverTrigger } from './custom-popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { loadGoogleMapsApi } from '@/lib/google-maps';

export interface Location {
  name: string;
  address: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface LocationAutocompleteProps {
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
}

export function LocationAutocomplete({
  onLocationSelect,
  placeholder = 'Search for a location...',
  className,
  defaultValue,
}: LocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue || '');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapDivCreated = useRef(false);

  useEffect(() => {
    let mapDiv: HTMLDivElement | null = null;

    // Create a hidden map div for PlacesService if it doesn't exist
    if (!mapRef.current) {
      mapDiv = document.createElement('div');
      mapDiv.style.display = 'none';
      document.body.appendChild(mapDiv);
      mapRef.current = mapDiv;
      mapDivCreated.current = true;
    }

    // Load Google Maps API
    loadGoogleMapsApi()
      .then(() => {
        if (mapRef.current) {
          autocompleteService.current = new google.maps.places.AutocompleteService();
          placesService.current = new google.maps.places.PlacesService(mapRef.current);
        }
      })
      .catch((err) => {
        console.error('Failed to load Google Maps API:', err);
        setError('Failed to load location search. Please try again later.');
      });

    // Cleanup function
    return () => {
      if (mapDivCreated.current && mapRef.current) {
        try {
          // Check if the element is still in the document
          if (document.body.contains(mapRef.current)) {
            document.body.removeChild(mapRef.current);
          }
        } catch (error) {
          console.error('Error cleaning up map div:', error);
        }
        mapRef.current = null;
        mapDivCreated.current = false;
      }
    };
  }, []);

  const handlePlaceSelect = async (placeId: string) => {
    if (!placesService.current) {
      setError('Location service not available');
      return;
    }

    setLoading(true);
    try {
      const place = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
        placesService.current!.getDetails(
          {
            placeId,
            fields: ['name', 'formatted_address', 'geometry', 'address_components'],
          },
          (result, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && result) {
              resolve(result);
            } else {
              reject(new Error(`Place details failed: ${status}`));
            }
          }
        );
      });

      const city = place.address_components?.find(
        (component) =>
          component.types.includes('locality') ||
          component.types.includes('administrative_area_level_1')
      )?.long_name || '';

      const location: Location = {
        name: place.name || '',
        address: place.formatted_address || '',
        city,
        coordinates: {
          latitude: place.geometry?.location?.lat() || 0,
          longitude: place.geometry?.location?.lng() || 0,
        },
      };

      setValue(place.formatted_address || '');
      onLocationSelect(location);
      setOpen(false);
      setPredictions([]);
      setError(null);
    } catch (error) {
      console.error('Error getting place details:', error);
      setError('Failed to get location details');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchText: string) => {
    setValue(searchText);

    if (!searchText || !autocompleteService.current) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    try {
      const results = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
        autocompleteService.current!.getPlacePredictions(
          {
            input: searchText,
            componentRestrictions: { country: 'FR' },
            types: ['establishment'], // Use only establishment type for better compatibility
          },
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              resolve(predictions);
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              resolve([]); // Return empty array for no results
            } else {
              reject(new Error(`Autocomplete failed: ${status}`));
            }
          }
        );
      });
      setPredictions(results);
      setError(null);
    } catch (error) {
      console.error('Error getting predictions:', error);
      setError('Failed to get location suggestions');
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center">
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleSearch(e.target.value)}
            onClick={() => setOpen(true)}
            className={cn(
              'w-full',
              className
            )}
          />
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search location..."
            value={value}
            onValueChange={handleSearch}
          />
          <CommandEmpty>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-destructive py-6 px-4 text-center">{error}</div>
            ) : (
              'No locations found.'
            )}
          </CommandEmpty>
          <CommandGroup>
            {predictions.map((prediction) => (
              <CommandItem
                key={prediction.place_id}
                value={prediction.description}
                onSelect={() => handlePlaceSelect(prediction.place_id)}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === prediction.description ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {prediction.description}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 