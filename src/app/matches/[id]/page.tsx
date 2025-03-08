import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { MatchService } from '@/services/match.service';
import { RatingService } from '@/services/rating.service';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Star } from 'lucide-react';
import { format } from 'date-fns';

export const metadata = {
  title: 'Match Details | NextGenFut',
  description: 'View match details and join teams',
};

async function getMatchData(id: string) {
  const match = await MatchService.getMatchById(id);
  if (!match) {
    return null;
  }

  let ratings = [];
  if (match.status === 'completed') {
    ratings = await RatingService.getMatchRatings(id);
  }

  return { match, ratings };
}

export default async function MatchDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/login');
  }

  const data = await getMatchData(params.id);
  if (!data) {
    redirect('/matches');
  }

  const { match, ratings } = data;
  const statusColors = {
    scheduled: 'bg-blue-500',
    'in-progress': 'bg-green-500',
    completed: 'bg-gray-500',
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex flex-col">
              <Badge
                className={`${statusColors[match.status]} text-white`}
                variant="secondary"
              >
                {match.status}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(match.date), 'PPp')}</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Location */}
            <div className="flex items-start space-x-2">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-medium">{match.location.name}</span>
                <span className="text-sm text-gray-500">
                  {match.location.address}, {match.location.city}
                </span>
              </div>
            </div>

            {/* Teams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Home Team */}
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-semibold">Home Team</h3>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {match.teams.home.length} players
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {match.teams.home.length > 0 ? (
                    <ul className="space-y-2">
                      {match.teams.home.map((player: any) => (
                        <li key={player.id} className="flex items-center space-x-2">
                          <span>{player.name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No players yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Away Team */}
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-semibold">Away Team</h3>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {match.teams.away.length} players
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {match.teams.away.length > 0 ? (
                    <ul className="space-y-2">
                      {match.teams.away.map((player: any) => (
                        <li key={player.id} className="flex items-center space-x-2">
                          <span>{player.name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No players yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Score */}
            {match.status === 'completed' && (
              <div className="flex justify-center items-center space-x-4 text-2xl font-bold">
                <span>{match.scores.home}</span>
                <span>-</span>
                <span>{match.scores.away}</span>
              </div>
            )}

            {/* Ratings */}
            {match.status === 'completed' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Player Ratings</span>
                </h3>
                {ratings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ratings.map((rating: any) => (
                      <Card key={rating.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{rating.playerId.name}</p>
                              <p className="text-sm text-gray-500">
                                Rated by: {rating.raterId.name}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <span className="font-medium">
                                {(
                                  Object.values(rating.skills).reduce(
                                    (a: number, b: number) => a + b,
                                    0
                                  ) / 6
                                ).toFixed(1)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(rating.skills).map(([skill, value]) => (
                              <div key={skill} className="flex justify-between">
                                <span className="capitalize">{skill}</span>
                                <span>{value}/10</span>
                              </div>
                            ))}
                          </div>
                          {rating.comments && (
                            <p className="mt-2 text-sm text-gray-600">
                              "{rating.comments}"
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No ratings yet</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              {match.status === 'scheduled' && (
                <>
                  <Button variant="outline" onClick={() => {}}>
                    Join Home Team
                  </Button>
                  <Button variant="outline" onClick={() => {}}>
                    Join Away Team
                  </Button>
                </>
              )}
              {match.status === 'completed' && (
                <Button onClick={() => {}}>Rate Players</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 