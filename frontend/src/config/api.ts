// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// API endpoints
export const API_ENDPOINTS = {
  // WODs
  WODS: `${API_BASE_URL}/wods`,
  WOD_RESULTS: `${API_BASE_URL}/wods/results`,
  LEADERBOARD: `${API_BASE_URL}/wods/leaderboard`,
  
  // Users
  USERS: `${API_BASE_URL}/users`,
  USER_STATS: `${API_BASE_URL}/users/stats`,
  
  // Rankings
  GLOBAL_RANKING: `${API_BASE_URL}/rankings/global`,
  BOX_RANKING: `${API_BASE_URL}/rankings/box`,
} as const;
