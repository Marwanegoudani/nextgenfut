import { Match, Location } from '@/types';
import MatchModel from '@/models/match';
import { Types } from 'mongoose';

// Utility function to add retry logic
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))); // Exponential backoff
        console.log(`Retrying operation (attempt ${i + 2}/${maxRetries})...`);
      }
    }
  }
  throw lastError!;
}

export class MatchService {
  // Create a new match
  static async createMatch(
    date: Date,
    location: Location,
    createdBy: string
  ): Promise<Match> {
    return withRetry(async () => {
      try {
        const match = await MatchModel.create({
          date,
          location,
          teams: { home: [], away: [] },
          scores: { home: 0, away: 0 },
          status: 'scheduled',
          createdBy,
        });

        return match.toObject() as Match;
      } catch (error) {
        throw new Error(`Failed to create match: ${(error as Error).message}`);
      }
    });
  }

  // Get match by ID
  static async getMatchById(id: string): Promise<Match | null> {
    return withRetry(async () => {
      try {
        const match = await MatchModel.findById(id)
          .maxTimeMS(15000) // Set 15s timeout
          .populate('teams.home', 'name')
          .populate('teams.away', 'name')
          .populate('createdBy', 'name')
          .lean();

        return match ? (match as unknown as Match) : null;
      } catch (error) {
        throw new Error(`Failed to get match: ${(error as Error).message}`);
      }
    });
  }

  // Get matches with filters
  static async getMatches(filters: {
    status?: 'scheduled' | 'in-progress' | 'completed';
    city?: string;
    date?: { start: Date; end: Date };
    limit?: number;
    skip?: number;
  }): Promise<{ matches: Match[]; total: number }> {
    return withRetry(async () => {
      try {
        const query: Record<string, any> = {};

        if (filters.status) {
          query.status = filters.status;
        }

        if (filters.city) {
          query['location.city'] = filters.city;
        }

        if (filters.date) {
          query.date = {
            $gte: filters.date.start,
            $lte: filters.date.end,
          };
        }

        // Set reasonable defaults for pagination
        const limit = filters.limit || 10;
        const skip = filters.skip || 0;

        const [matches, total] = await Promise.all([
          MatchModel.find(query)
            .maxTimeMS(15000) // Set 15s timeout
            .sort({ date: 1 })
            .skip(skip)
            .limit(limit)
            .populate('teams.home', 'name')
            .populate('teams.away', 'name')
            .populate('createdBy', 'name')
            .lean(),
          MatchModel.countDocuments(query).maxTimeMS(15000), // Set 15s timeout
        ]);

        return {
          matches: matches as unknown as Match[],
          total,
        };
      } catch (error) {
        const errorMessage = (error as Error).message;
        if (errorMessage.includes('buffering timed out')) {
          throw new Error('Database operation timed out. Please try again.');
        }
        throw new Error(`Failed to get matches: ${errorMessage}`);
      }
    });
  }

  // Join a match (add player to a team)
  static async joinMatch(
    matchId: string,
    playerId: string,
    team: 'home' | 'away'
  ): Promise<Match> {
    return withRetry(async () => {
      try {
        const match = await MatchModel.findById(matchId).maxTimeMS(15000);
        if (!match) {
          throw new Error('Match not found');
        }

        if (match.status !== 'scheduled') {
          throw new Error('Cannot join a match that is not in scheduled status');
        }

        // Check if player is already in any team
        const isInHome = match.teams.home.includes(playerId);
        const isInAway = match.teams.away.includes(playerId);
        
        if (isInHome || isInAway) {
          throw new Error('Player is already in a team');
        }

        // Add player to selected team
        match.teams[team].push(playerId);
        await match.save();

        return match.toObject() as Match;
      } catch (error) {
        throw new Error(`Failed to join match: ${(error as Error).message}`);
      }
    });
  }

  // Update match status and scores
  static async updateMatchStatus(
    matchId: string,
    status: 'scheduled' | 'in-progress' | 'completed',
    scores?: { home: number; away: number }
  ): Promise<Match> {
    return withRetry(async () => {
      try {
        const match = await MatchModel.findById(matchId).maxTimeMS(15000);
        if (!match) {
          throw new Error('Match not found');
        }

        match.status = status;
        if (scores) {
          match.scores = scores;
        }

        await match.save();
        return match.toObject() as Match;
      } catch (error) {
        throw new Error(`Failed to update match status: ${(error as Error).message}`);
      }
    });
  }

  // Delete a match
  static async deleteMatch(matchId: string): Promise<void> {
    return withRetry(async () => {
      try {
        const result = await MatchModel.deleteOne({ _id: matchId }).maxTimeMS(15000);
        if (result.deletedCount === 0) {
          throw new Error('Match not found');
        }
      } catch (error) {
        throw new Error(`Failed to delete match: ${(error as Error).message}`);
      }
    });
  }
} 