import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AvailablePlayersList } from '@/components/players/AvailablePlayersList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Available Players | NextGenFut',
  description: 'Find players available for matches',
};

export default async function AvailablePlayersPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Available Players</h1>
          <p className="text-gray-500 mt-2">
            Find players available for matches in your area
          </p>
        </div>
        <Link href="/matches" passHref>
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Matches
          </Button>
        </Link>
      </div>

      <AvailablePlayersList />
    </main>
  );
} 