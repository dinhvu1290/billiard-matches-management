export interface Match {
  id: string;
  date: Date;
  players: Player[];
  scores: Score[];
}

export interface Player {
  id: string;
  name: string;
  totalScore: number;
}

export interface Score {
  playerId: string;
  points: number;
} 