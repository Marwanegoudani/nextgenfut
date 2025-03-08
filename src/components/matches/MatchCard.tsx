import { Match } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

interface MatchCardProps {
  match: Match;
  onJoin?: (team: 'home' | 'away') => void;
  onViewDetails?: () => void;
  showJoinButtons?: boolean;
}

export function MatchCard({
  match,
  onJoin,
  onViewDetails,
  showJoinButtons = true,
}: MatchCardProps) {
  const statusColors = {
    scheduled: 'bg-blue-500',
    'in-progress': 'bg-green-500',
    completed: 'bg-gray-500',
  };

  return (
    <Card className="w-full max-w-md">
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

      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-medium">{match.location.name}</span>
              <span className="text-sm text-gray-500">
                {match.location.address}, {match.location.city}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  Home: {match.teams.home.length} players
                </span>
                <span className="text-sm font-medium">
                  Away: {match.teams.away.length} players
                </span>
              </div>
            </div>

            {match.status === 'completed' && (
              <div className="text-lg font-bold">
                {match.scores.home} - {match.scores.away}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between space-x-2">
        {showJoinButtons && match.status === 'scheduled' && onJoin && (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onJoin('home')}
            >
              Join Home
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onJoin('away')}
            >
              Join Away
            </Button>
          </>
        )}
        {onViewDetails && (
          <Button
            variant="default"
            className={!showJoinButtons ? 'w-full' : 'flex-1'}
            onClick={onViewDetails}
          >
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 