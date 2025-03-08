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
  const dummyElement = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Load Google Maps JavaScript API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      // Create a dummy div for PlacesService (required)
      if (!dummyElement.current) {
        dummyElement.current = document.createElement('div');
        placesService.current = new google.maps.places.PlacesService(dummyElement.current);
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const getPlaceDetails = (placeId: string) => {
    if (!placesService.current) return;

    const request = {
      placeId,
      fields: ['name', 'formatted_address', 'geometry', 'address_components'],
    };

    placesService.current.getDetails(
      request,
      (
        place: google.maps.places.PlaceResult | null,
        status: google.maps.places.PlacesServiceStatus
      ) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const city = place.address_components?.find(
            (component) =>
              component.types.includes('locality') ||
              component.types.includes('administrative_area_level_1')
          )?.long_name;

          const location: Location = {
            name: place.name || '',
            address: place.formatted_address || '',
            city: city || '',
            coordinates: {
              latitude: place.geometry?.location?.lat() || 0,
              longitude: place.geometry?.location?.lng() || 0,
            },
          };

          onLocationSelect(location);
          setValue(place.formatted_address || '');
          setOpen(false);
        }
      }
    );
  };

  const handleSearch = async (searchText: string) => {
    setValue(searchText);

    if (!searchText || !autocompleteService.current) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    const request = {
      input: searchText,
      componentRestrictions: { country: 'FR' }, // Restrict to France
      types: ['establishment', 'geocode'],
    };

    autocompleteService.current.getPlacePredictions(
      request,
      (
        results: google.maps.places.AutocompletePrediction[] | null,
        status: google.maps.places.PlacesServiceStatus
      ) => {
        setLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
        } else {
          setPredictions([]);
        }
      }
    );
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
      <PopoverContent className="w-full p-0" align="start">
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
                onSelect={() => getPlaceDetails(prediction.place_id)}
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