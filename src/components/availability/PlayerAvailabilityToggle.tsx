'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Clock, 
  MapPin, 
  Loader2, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { PlayerAvailability } from '@/types';

interface PlayerAvailabilityToggleProps {
  initialAvailability?: PlayerAvailability;
  userId: string;
}

export function PlayerAvailabilityToggle({
  initialAvailability,
  userId,
}: PlayerAvailabilityToggleProps) {
  const [isAvailable, setIsAvailable] = useState(initialAvailability?.isAvailable || false);
  const [duration, setDuration] = useState<number>(2); // Default 2 hours
  const [maxDistance, setMaxDistance] = useState<number>(initialAvailability?.maxDistance || 10); // Default 10km
  const [preferredPositions, setPreferredPositions] = useState<string[]>(
    initialAvailability?.preferredPositions || []
  );
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    initialAvailability?.location || null
  );

  // Get user's location when component mounts
  useEffect(() => {
    if (!userLocation && isAvailable) {
      getUserLocation();
    }
  }, [isAvailable, userLocation]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  const togglePosition = (position: string) => {
    setPreferredPositions((prev) => {
      if (prev.includes(position)) {
        return prev.filter((p) => p !== position);
      } else {
        return [...prev, position];
      }
    });
  };

  const handleAvailabilityToggle = async () => {
    // If turning on availability, ensure we have location
    if (!isAvailable && !userLocation) {
      getUserLocation();
      return;
    }

    setLoading(true);

    try {
      // Calculate availableUntil date
      const availableUntil = new Date();
      availableUntil.setHours(availableUntil.getHours() + duration);

      const availabilityData: PlayerAvailability = {
        isAvailable: !isAvailable,
        availableUntil: availableUntil,
        preferredPositions: preferredPositions.length > 0 ? preferredPositions as any : undefined,
        maxDistance,
        location: userLocation || undefined,
        lastUpdated: new Date(),
      };

      // Update availability in the database
      const response = await fetch(`/api/users/${userId}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(availabilityData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update availability');
      }

      setIsAvailable(!isAvailable);
      toast.success(
        !isAvailable
          ? 'You are now available for matches!'
          : 'You are no longer available for matches'
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            checked={isAvailable}
            onCheckedChange={handleAvailabilityToggle}
            disabled={loading}
          />
          <Label htmlFor="availability-mode" className="font-medium">
            {isAvailable ? 'Available for matches' : 'Not available'}
          </Label>
        </div>
        <div>
          {isAvailable ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {isAvailable && (
        <Tabs defaultValue="duration" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="duration" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Duration
            </TabsTrigger>
            <TabsTrigger value="distance" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Distance
            </TabsTrigger>
            <TabsTrigger value="position" className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
              Position
            </TabsTrigger>
          </TabsList>

          <TabsContent value="duration" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Available for</Label>
                <span className="text-sm font-medium">{duration} hours</span>
              </div>
              <Slider
                value={[duration]}
                min={1}
                max={12}
                step={1}
                onValueChange={(value: number[]) => setDuration(value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1h</span>
                <span>6h</span>
                <span>12h</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="distance" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Maximum distance</Label>
                <span className="text-sm font-medium">{maxDistance} km</span>
              </div>
              <Slider
                value={[maxDistance]}
                min={1}
                max={50}
                step={1}
                onValueChange={(value: number[]) => setMaxDistance(value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1km</span>
                <span>25km</span>
                <span>50km</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="position" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Preferred positions</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={preferredPositions.includes('GK') ? 'default' : 'outline'}
                  onClick={() => togglePosition('GK')}
                  className="w-full"
                >
                  Goalkeeper
                </Button>
                <Button
                  type="button"
                  variant={preferredPositions.includes('DEF') ? 'default' : 'outline'}
                  onClick={() => togglePosition('DEF')}
                  className="w-full"
                >
                  Defender
                </Button>
                <Button
                  type="button"
                  variant={preferredPositions.includes('MID') ? 'default' : 'outline'}
                  onClick={() => togglePosition('MID')}
                  className="w-full"
                >
                  Midfielder
                </Button>
                <Button
                  type="button"
                  variant={preferredPositions.includes('FWD') ? 'default' : 'outline'}
                  onClick={() => togglePosition('FWD')}
                  className="w-full"
                >
                  Forward
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      <Button
        onClick={handleAvailabilityToggle}
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : isAvailable ? (
          'Set as Unavailable'
        ) : (
          'Set as Available'
        )}
      </Button>
    </div>
  );
} 