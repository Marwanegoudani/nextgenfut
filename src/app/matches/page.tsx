import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MatchListClient } from '@/components/matches/MatchListClient';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MatchService } from '@/services/match.service';

export const metadata = {
  title: 'Matches | NextGenFut',
  description: 'View and join football matches',
};

async function getMatches(searchParams: {
  page?: string;
  status?: string;
  city?: string;
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 10;
  const skip = (page - 1) * limit;

  const filters: any = {
    limit,
    skip,
  };

  if (searchParams.status) {
    filters.status = searchParams.status;
  }

  if (searchParams.city) {
    filters.city = searchParams.city;
  }

  return MatchService.getMatches(filters);
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string; city?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/login');
  }

  const { matches, total } = await getMatches(searchParams);
  const currentPage = parseInt(searchParams.page || '1', 10);

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