import { Rating } from '@/types';
import RatingModel from '@/models/rating';
import MatchModel from '@/models/match';

export class RatingService {
  // Create a new rating
  static async createRating(
    matchId: string,
    playerId: string,
    raterId: string,
    skills: Rating['skills'],
    comments?: string
  ): Promise<Rating> {
    try {
      // Verify match exists and is completed
      const match = await MatchModel.findById(matchId);
      if (!match) {
        throw new Error('Match not found');
      }
      if (match.status !== 'completed') {
        throw new Error('Can only rate players after match is completed');
      }

      // Verify player was in the match
      const wasInMatch = [...match.teams.home, ...match.teams.away].includes(playerId);
      if (!wasInMatch) {
        throw new Error('Player was not in this match');
      }

      // Create rating
      const rating = await RatingModel.create({
        matchId,
        playerId,
        raterId,
        skills,
        comments,
      });

      return rating.toObject() as Rating;
    } catch (error) {
      throw new Error(`Failed to create rating: ${(error as Error).message}`);
    }
  }

  // Get ratings for a player
  static async getPlayerRatings(
    playerId: string,
    options: {
      limit?: number;
      skip?: number;
      sortBy?: 'date' | 'rating';
      order?: 'asc' | 'desc';
    } = {}
  ): Promise<{ ratings: Rating[]; total: number }> {
    try {
      const { limit = 10, skip = 0, sortBy = 'date', order = 'desc' } = options;

      const sort: Record<string, 1 | -1> = {};
      if (sortBy === 'date') {
        sort.createdAt = order === 'desc' ? -1 : 1;
      } else {
        sort.averageRating = order === 'desc' ? -1 : 1;
      }

      const [ratings, total] = await Promise.all([
        RatingModel.find({ playerId })
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('matchId', 'date location')
          .populate('raterId', 'name')
          .lean(),
        RatingModel.countDocuments({ playerId }),
      ]);

      return { ratings: ratings as unknown as Rating[], total };
    } catch (error) {
      throw new Error(`Failed to get player ratings: ${(error as Error).message}`);
    }
  }

  // Get match ratings
  static async getMatchRatings(matchId: string): Promise<Rating[]> {
    try {
      const ratings = await RatingModel.find({ matchId })
        .populate('playerId', 'name')
        .populate('raterId', 'name')
        .lean();

      return ratings as unknown as Rating[];
    } catch (error) {
      throw new Error(`Failed to get match ratings: ${(error as Error).message}`);
    }
  }

  // Get player's average ratings
  static async getPlayerAverageRatings(playerId: string): Promise<{
    overall: number;
    skills: {
      pace: number;
      shooting: number;
      passing: number;
      dribbling: number;
      defending: number;
      physical: number;
    };
    totalRatings: number;
  }> {
    try {
      const ratings = await RatingModel.find({ playerId });
      
      if (ratings.length === 0) {
        return {
          overall: 0,
          skills: {
            pace: 0,
            shooting: 0,
            passing: 0,
            dribbling: 0,
            defending: 0,
            physical: 0,
          },
          totalRatings: 0,
        };
      }

      const skillSums = {
        pace: 0,
        shooting: 0,
        passing: 0,
        dribbling: 0,
        defending: 0,
        physical: 0,
      };

      ratings.forEach((rating) => {
        Object.keys(skillSums).forEach((skill) => {
          skillSums[skill as keyof typeof skillSums] += rating.skills[skill as keyof typeof skillSums];
        });
      });

      const averageSkills = Object.fromEntries(
        Object.entries(skillSums).map(([skill, sum]) => [
          skill,
          Number((sum / ratings.length).toFixed(1)),
        ])
      ) as typeof skillSums;

      const overall = Number(
        (
          Object.values(averageSkills).reduce((a, b) => a + b, 0) / 6
        ).toFixed(1)
      );

      return {
        overall,
        skills: averageSkills,
        totalRatings: ratings.length,
      };
    } catch (error) {
      throw new Error(`Failed to get player average ratings: ${(error as Error).message}`);
    }
  }

  // Update a rating
  static async updateRating(
    ratingId: string,
    skills: Partial<Rating['skills']>,
    comments?: string
  ): Promise<Rating> {
    try {
      const rating = await RatingModel.findById(ratingId);
      if (!rating) {
        throw new Error('Rating not found');
      }

      // Update only provided skills
      Object.entries(skills).forEach(([skill, value]) => {
        if (value !== undefined) {
          rating.skills[skill as keyof Rating['skills']] = value;
        }
      });

      if (comments !== undefined) {
        rating.comments = comments;
      }

      await rating.save();
      return rating.toObject() as Rating;
    } catch (error) {
      throw new Error(`Failed to update rating: ${(error as Error).message}`);
    }
  }

  // Delete a rating
  static async deleteRating(ratingId: string): Promise<void> {
    try {
      const result = await RatingModel.deleteOne({ _id: ratingId });
      if (result.deletedCount === 0) {
        throw new Error('Rating not found');
      }
    } catch (error) {
      throw new Error(`Failed to delete rating: ${(error as Error).message}`);
    }
  }
} 