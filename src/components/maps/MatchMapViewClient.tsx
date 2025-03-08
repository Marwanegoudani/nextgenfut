'use client';

import { useRouter } from 'next/navigation';
import { MatchMapView } from './MatchMapView';
import { Match } from '@/types';
import { toast } from 'sonner';

interface MatchMapViewClientProps {
  initialMatches: Match[];
}

export function MatchMapViewClient({
  initialMatches,
}: MatchMapViewClientProps) {
  const router = useRouter();

  const handleJoinMatch = async (matchId: string, team: 'home' | 'away') => {
    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ team }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join match');
      }

      toast.success('Successfully joined the match');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to join match');
    }
  };

  const handleViewDetails = (matchId: string) => {
    router.push(`/matches/${matchId}`);
  };

  return (
    <MatchMapView
      matches={initialMatches}
      onJoinMatch={handleJoinMatch}
      onViewDetails={handleViewDetails}
    />
  );
} 