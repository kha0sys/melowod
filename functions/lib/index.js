"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onWodResultCreated = exports.onUserCreated = exports.getWodCompletion = exports.getLeaderboard = exports.getUserResults = exports.getWodResults = exports.submitWodResult = exports.listWods = exports.getWod = exports.deleteWod = exports.updateWod = exports.createWod = exports.getBoxAnalytics = exports.getUserAnalytics = exports.updateUserProfile = exports.updateUserPreferences = exports.getUser = exports.updateUser = exports.createUser = void 0;
const functions = __importStar(require("firebase-functions"));
const WodService_1 = require("./application/wod/WodService");
const UserService_1 = require("./application/user/UserService");
// User Management Functions
exports.createUser = functions.https.onCall(async (data) => {
    return UserService_1.userService.createUser(data);
});
exports.updateUser = functions.https.onCall(async (data) => {
    return UserService_1.userService.updateUser(data.id, data.user);
});
exports.getUser = functions.https.onCall(async (data) => {
    return UserService_1.userService.getUser(data.id);
});
exports.updateUserPreferences = functions.https.onCall(async (data) => {
    return UserService_1.userService.updatePreferences(data.id, data.preferences);
});
exports.updateUserProfile = functions.https.onCall(async (data) => {
    return UserService_1.userService.updateProfile(data.id, data.profile);
});
exports.getUserAnalytics = functions.https.onCall(async (data) => {
    return UserService_1.userService.getUserAnalytics(data.id);
});
exports.getBoxAnalytics = functions.https.onCall(async (data) => {
    return UserService_1.userService.getBoxAnalytics(data.boxName);
});
// WOD Management Functions
exports.createWod = functions.https.onCall(async (data) => {
    return WodService_1.wodService.createWod(data);
});
exports.updateWod = functions.https.onCall(async (data) => {
    return WodService_1.wodService.updateWod(data.id, data.wod);
});
exports.deleteWod = functions.https.onCall(async (data) => {
    return WodService_1.wodService.deleteWod(data.id);
});
exports.getWod = functions.https.onCall(async (data) => {
    return WodService_1.wodService.getWod(data.id);
});
exports.listWods = functions.https.onCall(async (data) => {
    return WodService_1.wodService.listWods(data.filters);
});
// WOD Result Functions
exports.submitWodResult = functions.https.onCall(async (data) => {
    return WodService_1.wodService.submitResult(data);
});
exports.getWodResults = functions.https.onCall(async (data) => {
    return WodService_1.wodService.getWodResults(data.wodId);
});
exports.getUserResults = functions.https.onCall(async (data) => {
    return WodService_1.wodService.getUserResults(data.userId);
});
exports.getLeaderboard = functions.https.onCall(async (data) => {
    return WodService_1.wodService.getLeaderboard(data.wodId, data.limit);
});
exports.getWodCompletion = functions.https.onCall(async (data) => {
    return WodService_1.wodService.getWodCompletion(data.wodId);
});
// Auth Triggers
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
    try {
        await UserService_1.userService.createUser({
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
    }
    catch (error) {
        console.error('Error creating user profile:', error);
    }
});
// Firestore Triggers
exports.onWodResultCreated = functions.firestore
    .document('wodResults/{resultId}')
    .onCreate(async (snap, context) => {
    const result = snap.data();
    try {
        await WodService_1.wodService.updateUserStats(result.userId);
    }
    catch (error) {
        console.error('Error updating user stats:', error);
    }
});
//# sourceMappingURL=index.js.map