import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { PlayerAvailabilityToggle } from '@/components/availability/PlayerAvailabilityToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserModel } from '@/models/user';
import dbConnect from '@/lib/db';
import { PlayerAvailability } from '@/types';

export const metadata = {
  title: 'Dashboard | NextGenFut',
  description: 'Your football dashboard',
};

interface PlayerWithAvailability {
  _id: string;
  availability?: PlayerAvailability;
}

async function getUserAvailability(userId: string): Promise<PlayerAvailability | undefined> {
  await dbConnect();
  
  const user = await UserModel.findById(userId)
    .select('availability')
    .lean() as PlayerWithAvailability;
    
  return user?.availability;
}

export default async function DashboardPage() {
  // Check if user is logged in
  const session = await getServerSession(authOptions);
  
  // If not logged in, redirect to login
  if (!session) {
    redirect("/auth/login");
  }

  const availability = await getUserAvailability(session.user.id);

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <Tabs defaultValue="availability" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="matches">My Matches</TabsTrigger>
        </TabsList>
        
        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Player Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerAvailabilityToggle 
                initialAvailability={availability}
                userId={session.user.id}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Your performance statistics will appear here once you've played some matches.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="matches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Your upcoming and past matches will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
} 