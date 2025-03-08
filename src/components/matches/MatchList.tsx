import { useState } from 'react';
import { Match } from '@/types';
import { MatchCard } from './MatchCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';

interface MatchListProps {
  matches: Match[];
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: {
    status?: string;
    city?: string;
  }) => void;
  onJoinMatch: (matchId: string, team: 'home' | 'away') => void;
}

export function MatchList({
  matches,
  total,
  currentPage,
  onPageChange,
  onFilterChange,
  onJoinMatch,
}: MatchListProps) {
  const router = useRouter();
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleCityChange = (value: string) => {
    setCityFilter(value);
    onFilterChange({ status: statusFilter === 'all' ? undefined : statusFilter, city: value });
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    onFilterChange({ status: value === 'all' ? undefined : value, city: cityFilter });
  };

  const totalPages = Math.ceil(total / 10); // Assuming 10 items per page

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Filter by city..."
            value={cityFilter}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Match Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onJoin={(team) => onJoinMatch(match.id, team)}
            onViewDetails={() => router.push(`/matches/${match.id}`)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {matches.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No matches found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
} 