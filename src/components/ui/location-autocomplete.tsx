'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from './input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';

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
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create a hidden map div for PlacesService
    if (!mapRef.current) {
      const mapDiv = document.createElement('div');
      mapDiv.style.display = 'none';
      document.body.appendChild(mapDiv);
      mapRef.current = mapDiv;
    }

    // Load Google Maps JavaScript API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      placesService.current = new google.maps.places.PlacesService(mapRef.current!);
    };
    document.head.appendChild(script);

    return () => {
      if (mapRef.current) {
        document.body.removeChild(mapRef.current);
      }
      const scriptElement = document.querySelector(`script[src^="https://maps.googleapis.com/maps/api/js"]`);
      if (scriptElement) {
        document.head.removeChild(scriptElement);
      }
    };
  }, []);

  const handlePlaceSelect = async (placeId: string) => {
    if (!placesService.current) return;

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
    } catch (error) {
      console.error('Error getting place details:', error);
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
            types: ['address', 'establishment', 'geocode'],
          },
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              resolve(predictions);
            } else {
              reject(new Error(`Autocomplete failed: ${status}`));
            }
          }
        );
      });
      setPredictions(results);
    } catch (error) {
      console.error('Error getting predictions:', error);
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
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
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