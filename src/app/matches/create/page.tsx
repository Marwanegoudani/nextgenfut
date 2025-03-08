import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { CreateMatchClient } from '@/components/matches/CreateMatchClient';

export const metadata = {
  title: 'Create Match | NextGenFut',
  description: 'Create a new football match',
};

export default async function CreateMatchPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <main className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create a Match</h1>
        <p className="text-gray-500 mt-2">
          Fill in the details to organize a new football match
        </p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <CreateMatchClient />
      </div>
    </main>
  );
} 