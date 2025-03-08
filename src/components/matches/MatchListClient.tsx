'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { MatchList } from './MatchList';
import { Match } from '@/types';
import { toast } from 'sonner';

interface MatchListClientProps {
  initialMatches: Match[];
  initialTotal: number;
  initialPage: number;
}

export function MatchListClient({
  initialMatches,
  initialTotal,
  initialPage,
}: MatchListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/matches?${params.toString()}`);
  };

  const handleFilterChange = (filters: { status?: string; city?: string }) => {
    const params = new URLSearchParams(searchParams);
    if (filters.status) {
      params.set('status', filters.status);
    } else {
      params.delete('status');
    }
    if (filters.city) {
      params.set('city', filters.city);
    } else {
      params.delete('city');
    }
    params.set('page', '1');
    router.push(`/matches?${params.toString()}`);
  };

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

  return (
    <MatchList
      matches={initialMatches}
      total={initialTotal}
      currentPage={initialPage}
      onPageChange={handlePageChange}
      onFilterChange={handleFilterChange}
      onJoinMatch={handleJoinMatch}
    />
  );
} 