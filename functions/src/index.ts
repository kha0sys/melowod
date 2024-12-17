import * as functions from 'firebase-functions';
import { wodService } from './application/wod/WodService';
import { userService } from './application/user/UserService';
import { Wod, WodResult } from './domain/entities/Wod';
import { User, UserPreferences, UserProfile } from './domain/entities/User';

// User Management Functions
export const createUser = functions.https.onCall(async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
  return userService.createUser(data);
});

export const updateUser = functions.https.onCall(async (data: { id: string; user: Partial<User> }) => {
  return userService.updateUser(data.id, data.user);
});

export const getUser = functions.https.onCall(async (data: { id: string }) => {
  return userService.getUser(data.id);
});

export const updateUserPreferences = functions.https.onCall(
  async (data: { id: string; preferences: Partial<UserPreferences> }) => {
    return userService.updatePreferences(data.id, data.preferences);
  }
);

export const updateUserProfile = functions.https.onCall(
  async (data: { id: string; profile: Partial<UserProfile> }) => {
    return userService.updateProfile(data.id, data.profile);
  }
);

export const getUserAnalytics = functions.https.onCall(async (data: { id: string }) => {
  return userService.getUserAnalytics(data.id);
});

export const getBoxAnalytics = functions.https.onCall(async (data: { boxName: string }) => {
  return userService.getBoxAnalytics(data.boxName);
});

// WOD Management Functions
export const createWod = functions.https.onCall(async (data: Omit<Wod, 'id' | 'createdAt' | 'updatedAt'>) => {
  return wodService.createWod(data);
});

export const updateWod = functions.https.onCall(async (data: { id: string; wod: Partial<Wod> }) => {
  return wodService.updateWod(data.id, data.wod);
});

export const deleteWod = functions.https.onCall(async (data: { id: string }) => {
  return wodService.deleteWod(data.id);
});

export const getWod = functions.https.onCall(async (data: { id: string }) => {
  return wodService.getWod(data.id);
});

export const listWods = functions.https.onCall(async (data: { filters?: any }) => {
  return wodService.listWods(data.filters);
});

// WOD Result Functions
export const submitWodResult = functions.https.onCall(async (data: Omit<WodResult, 'id' | 'createdAt'>) => {
  return wodService.submitResult(data);
});

export const getWodResults = functions.https.onCall(async (data: { wodId: string }) => {
  return wodService.getWodResults(data.wodId);
});

export const getUserResults = functions.https.onCall(async (data: { userId: string }) => {
  return wodService.getUserResults(data.userId);
});

export const getLeaderboard = functions.https.onCall(async (data: { wodId: string; limit?: number }) => {
  return wodService.getLeaderboard(data.wodId, data.limit);
});

export const getWodCompletion = functions.https.onCall(async (data: { wodId: string }) => {
  return wodService.getWodCompletion(data.wodId);
});

// Auth Triggers
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    await userService.createUser({
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      role: 'athlete',
      preferences: {
        notifications: {
          email: true,
          push: true,
          wodReminders: true,
          leaderboardUpdates: true
        },
        privacySettings: {
          showProfile: true,
          showResults: true,
          showStats: true
        },
        measurementUnit: 'metric'
      },
      profile: {
        experience: 'beginner'
      }
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
});

// Firestore Triggers
export const onWodResultCreated = functions.firestore
  .document('wodResults/{resultId}')
  .onCreate(async (snap, context) => {
    const result = snap.data() as WodResult;
    try {
      await wodService.updateUserStats(result.userId);
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  });
