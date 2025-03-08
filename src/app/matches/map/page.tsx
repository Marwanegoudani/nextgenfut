import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MatchMapViewClient } from '@/components/maps/MatchMapViewClient';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MatchService } from '@/services/match.service';
import { Match } from '@/types';
import dbConnect from '@/lib/db';

export const metadata = {
  title: 'Match Map | NextGenFut',
  description: 'Find matches near you',
};

// Helper function to serialize dates and remove MongoDB specific fields
function serializeMatch(match: any): Match {
  return {
    id: match.id || match._id?.toString(),
    date: match.date instanceof Date ? match.date.toISOString() : match.date,
    location: {
      name: match.location.name,
      address: match.location.address,
      city: match.location.city,
      coordinates: {
        latitude: match.location.coordinates.latitude,
        longitude: match.location.coordinates.longitude,
      },
    },
    teams: {
      home: match.teams.home.map((player: any) => 
        typeof player === 'string' ? player : player.id || player._id?.toString()
      ),
      away: match.teams.away.map((player: any) => 
        typeof player === 'string' ? player : player.id || player._id?.toString()
      ),
    },
    status: match.status,
    scores: match.scores,
    createdBy: typeof match.createdBy === 'string' 
      ? match.createdBy 
      : match.createdBy?.id || match.createdBy?._id?.toString(),
    createdAt: match.createdAt instanceof Date ? match.createdAt.toISOString() : match.createdAt,
    updatedAt: match.updatedAt instanceof Date ? match.updatedAt.toISOString() : match.updatedAt,
  };
}

async function getMatches() {
  // Ensure database connection is established
  await dbConnect();
  
  try {
    const { matches } = await MatchService.getMatches({
      status: 'scheduled', // Only show scheduled matches on the map
    });
    
    // Serialize matches before returning
    return matches.map(serializeMatch);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
}

export default async function MatchMapPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/login');
  }

  const matches = await getMatches();

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Find Matches Near You</h1>
          <p className="text-gray-500 mt-2">
            Discover football matches in your area
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/matches" passHref>
            <Button variant="outline">List View</Button>
          </Link>
          <Link href="/matches/create" passHref>
            <Button>Create Match</Button>
          </Link>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="text-center py-12">Loading map...</div>
        }
      >
        <MatchMapViewClient initialMatches={matches} />
      </Suspense>
    </main>
  );
} 