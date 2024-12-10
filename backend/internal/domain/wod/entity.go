package wod

import (
	"time"
)

type DifficultyLevel string

const (
	RX          DifficultyLevel = "RX"
	Advanced    DifficultyLevel = "Advanced"
	Intermediate DifficultyLevel = "Intermediate"
	Beginner    DifficultyLevel = "Beginner"
)

type WodType string

const (
	ForTime WodType = "ForTime"
	AMRAP   WodType = "AMRAP"
)

type Movement struct {
	Name        string `json:"name" firestore:"name"`
	Description string `json:"description" firestore:"description"`
	VideoURL    string `json:"videoUrl" firestore:"videoUrl"`
}

type WodVariant struct {
	Level       DifficultyLevel `json:"level" firestore:"level"`
	Movements   []Movement      `json:"movements" firestore:"movements"`
	Description string         `json:"description" firestore:"description"`
}

type Wod struct {
	ID          string                `json:"id" firestore:"id"`
	Date        time.Time             `json:"date" firestore:"date"`
	Type        WodType              `json:"type" firestore:"type"`
	Title       string               `json:"title" firestore:"title"`
	Description string               `json:"description" firestore:"description"`
	TimeLimit   int                  `json:"timeLimit" firestore:"timeLimit"`
	Variants    map[string]WodVariant `json:"variants" firestore:"variants"`
	CreatedAt   time.Time            `json:"createdAt" firestore:"createdAt"`
	UpdatedAt   time.Time            `json:"updatedAt" firestore:"updatedAt"`
}

type WodResult struct {
	ID          string         `json:"id" firestore:"id"`
	WodID       string         `json:"wodId" firestore:"wodId"`
	UserID      string         `json:"userId" firestore:"userId"`
	Level       DifficultyLevel `json:"level" firestore:"level"`
	Score       int            `json:"score" firestore:"score"`
	TimeSeconds int            `json:"timeSeconds" firestore:"timeSeconds"`
	Notes       string         `json:"notes" firestore:"notes"`
	CreatedAt   time.Time      `json:"createdAt" firestore:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt" firestore:"updatedAt"`
}
