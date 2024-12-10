export interface User {
  id?: string;
  name: string;
  email: string;
  box?: string;
  level?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserStats {
  userId: string;
  totalWods: number;
  completedWods: number;
  points: number;
  rank: number;
  level: string;
  boxRank?: number;
}
