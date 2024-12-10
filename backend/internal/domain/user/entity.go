package user

import (
	"time"
)

type ExperienceLevel string

const (
	Beginner     ExperienceLevel = "Beginner"
	Intermediate ExperienceLevel = "Intermediate"
	Advanced     ExperienceLevel = "Advanced"
	Elite        ExperienceLevel = "Elite"
)

type User struct {
	ID              string         `json:"id" firestore:"id"`
	Email           string         `json:"email" firestore:"email"`
	Name            string         `json:"name" firestore:"name"`
	PhotoURL        string         `json:"photoUrl" firestore:"photoUrl"`
	Box             string         `json:"box" firestore:"box"`
	Country         string         `json:"country" firestore:"country"`
	City            string         `json:"city" firestore:"city"`
	ExperienceLevel ExperienceLevel `json:"experienceLevel" firestore:"experienceLevel"`
	Points          int            `json:"points" firestore:"points"`
	WodCount        int            `json:"wodCount" firestore:"wodCount"`
	Achievements    []string       `json:"achievements" firestore:"achievements"`
	CreatedAt       time.Time      `json:"createdAt" firestore:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt" firestore:"updatedAt"`
}

type Achievement struct {
	ID          string    `json:"id" firestore:"id"`
	Name        string    `json:"name" firestore:"name"`
	Description string    `json:"description" firestore:"description"`
	IconURL     string    `json:"iconUrl" firestore:"iconUrl"`
	Points      int       `json:"points" firestore:"points"`
	CreatedAt   time.Time `json:"createdAt" firestore:"createdAt"`
}

type UserStats struct {
	UserID           string    `json:"userId" firestore:"userId"`
	TotalWods        int       `json:"totalWods" firestore:"totalWods"`
	TotalPoints      int       `json:"totalPoints" firestore:"totalPoints"`
	ConsecutiveDays  int       `json:"consecutiveDays" firestore:"consecutiveDays"`
	LastWorkoutDate  time.Time `json:"lastWorkoutDate" firestore:"lastWorkoutDate"`
	AchievementCount int       `json:"achievementCount" firestore:"achievementCount"`
	UpdatedAt        time.Time `json:"updatedAt" firestore:"updatedAt"`
}
