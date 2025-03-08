import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MatchListClient } from '@/components/matches/MatchListClient';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MatchService } from '@/services/match.service';
import { Match } from '@/types';
import dbConnect from '@/lib/db';

export const metadata = {
  title: 'Matches | NextGenFut',
  description: 'View and join football matches',
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

async function getMatches(searchParams: Promise<{
  page?: string;
  status?: string;
  city?: string;
}>) {
  // Ensure database connection is established
  await dbConnect();
  
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const limit = 10;
  const skip = (page - 1) * limit;

  const filters: any = {
    limit,
    skip,
  };

  if (params.status) {
    filters.status = params.status;
  }

  if (params.city) {
    filters.city = params.city;
  }

  try {
    const { matches, total } = await MatchService.getMatches(filters);
    
    // Serialize matches before returning
    return {
      matches: matches.map(serializeMatch),
      total,
    };
  } catch (error) {
    console.error('Error fetching matches:', error);
    return {
      matches: [],
      total: 0,
    };
  }
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; city?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/login');
  }

  const { matches, total } = await getMatches(searchParams);
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Football Matches</h1>
          <p className="text-gray-500 mt-2">
            Find and join matches in your area
          </p>
        </div>
        <Link href="/matches/create" passHref>
          <Button>Create Match</Button>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="text-center py-12">Loading matches...</div>
        }
      >
        <MatchListClient
          initialMatches={matches}
          initialTotal={total}
          initialPage={currentPage}
        />
      </Suspense>
    </main>
  );
} 