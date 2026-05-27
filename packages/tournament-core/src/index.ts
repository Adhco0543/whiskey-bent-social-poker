// Tournament management logic
export class TournamentManager {
  static readonly TOURNAMENT_STATUSES = {
    SCHEDULED: 'scheduled',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  };

  static canRegister(status: string, maxPlayers: number, registeredPlayers: number): boolean {
    return (
      status === this.TOURNAMENT_STATUSES.SCHEDULED &&
      registeredPlayers < maxPlayers
    );
  }

  static calculatePrizePool(buyIn: number, players: number): number {
    // 10% house take, rest goes to prize pool
    return Math.floor(buyIn * players * 0.9);
  }

  static calculatePayout(
    prizePool: number,
    finishPosition: number,
    totalPlayers: number
  ): number {
    // Top 10% get paid
    const paidPlayers = Math.max(1, Math.floor(totalPlayers * 0.1));
    if (finishPosition > paidPlayers) return 0;

    // Simplified payout: top 3 get 50%, 25%, 15% of top finishers' share
    const topFinisherShare = prizePool / paidPlayers;
    switch (finishPosition) {
      case 1:
        return Math.floor(topFinisherShare * 0.5);
      case 2:
        return Math.floor(topFinisherShare * 0.25);
      case 3:
        return Math.floor(topFinisherShare * 0.15);
      default:
        return Math.floor(topFinisherShare * 0.1);
    }
  }
}

export default TournamentManager;
