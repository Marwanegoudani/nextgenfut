'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Clock, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AvailablePlayer {
  id: string;
  name: string;
  position: string[];
  maxDistance: number;
  availableUntil?: string;
}

interface AvailablePlayersListProps {
  matchId?: string; // Optional match ID for inviting players to a specific match
}

export function AvailablePlayersList({ matchId }: AvailablePlayersListProps) {
  const [players, setPlayers] = useState<AvailablePlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState(10);
  const [position, setPosition] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Get user's location when component mounts
  useEffect(() => {
    getUserLocation();
  }, []);

  // Fetch available players when location, distance, or position changes
  useEffect(() => {
    if (userLocation) {
      fetchAvailablePlayers();
    }
  }, [userLocation, distance, position]);

  const getUserLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  };

  const fetchAvailablePlayers = async () => {
    if (!userLocation) return;
    
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        latitude: userLocation.latitude.toString(),
        longitude: userLocation.longitude.toString(),
        distance: distance.toString(),
      });
      
      // Add position filter if selected
      if (position) {
        params.append('position', position);
      }
      
      // Fetch available players
      const response = await fetch(`/api/players/available?${params.toString()}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch available players');
      }
      
      const data = await response.json();
      setPlayers(data.players);
      setError(null);
    } catch (error) {
      console.error('Error fetching available players:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch available players');
    } finally {
      setLoading(false);
    }
  };

  const handleInvitePlayer = async (playerId: string) => {
    if (!matchId) {
      toast.error('No match selected for invitation');
      return;
    }
    
    try {
      const response = await fetch(`/api/matches/${matchId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to invite player');
      }
      
      toast.success('Player invited successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to invite player');
    }
  };

  const getPositionColor = (pos: string) => {
    switch (pos) {
      case 'GK': return 'bg-yellow-500';
      case 'DEF': return 'bg-blue-500';
      case 'MID': return 'bg-green-500';
      case 'FWD': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeRemaining = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    
    const availableUntil = new Date(dateString);
    const now = new Date();
    
    // Calculate hours and minutes remaining
    const diffMs = availableUntil.getTime() - now.getTime();
    if (diffMs <= 0) return 'No longer available';
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m remaining`;
    } else {
      return `${diffMins}m remaining`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 flex-1">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm whitespace-nowrap">Distance: {distance} km</span>
          <div className="w-full max-w-xs">
            <Slider
              value={[distance]}
              min={1}
              max={50}
              step={1}
              onValueChange={(value: number[]) => setDistance(value[0])}
              disabled={loading}
            />
          </div>
        </div>
        
        <Tabs 
          defaultValue="all" 
          value={position || 'all'} 
          onValueChange={(value) => setPosition(value === 'all' ? null : value)}
          className="w-full md:w-auto"
        >
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="GK">GK</TabsTrigger>
            <TabsTrigger value="DEF">DEF</TabsTrigger>
            <TabsTrigger value="MID">MID</TabsTrigger>
            <TabsTrigger value="FWD">FWD</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={getUserLocation}
          disabled={loading}
          className="whitespace-nowrap"
        >
          Refresh
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card className="p-6 text-center text-red-500">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={getUserLocation}
          >
            Try Again
          </Button>
        </Card>
      ) : players.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          <p>No available players found in your area.</p>
          <p className="text-sm mt-2">Try increasing the distance or changing the position filter.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <Card key={player.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{player.name}</CardTitle>
                <div className="flex flex-wrap gap-1 mt-1">
                  {player.position.map((pos) => (
                    <Badge 
                      key={pos} 
                      className={`${getPositionColor(pos)} text-white`}
                    >
                      {pos}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatTimeRemaining(player.availableUntil)}</span>
                  </div>
                  <div>
                    <MapPin className="h-4 w-4 inline mr-1" />
                    <span>Max {player.maxDistance} km</span>
                  </div>
                </div>
                
                {matchId && (
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => handleInvitePlayer(player.id)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite to Match
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 