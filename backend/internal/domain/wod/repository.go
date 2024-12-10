package wod

import (
	"context"
	"time"
)

type Repository interface {
	// WOD operations
	CreateWod(ctx context.Context, wod *Wod) error
	GetWodByID(ctx context.Context, id string) (*Wod, error)
	GetWodByDate(ctx context.Context, date time.Time) (*Wod, error)
	ListWods(ctx context.Context, limit int, startAfter time.Time) ([]*Wod, error)
	UpdateWod(ctx context.Context, wod *Wod) error
	DeleteWod(ctx context.Context, id string) error

	// WOD Results operations
	CreateWodResult(ctx context.Context, result *WodResult) error
	GetWodResult(ctx context.Context, id string) (*WodResult, error)
	ListWodResults(ctx context.Context, wodID string, limit int) ([]*WodResult, error)
	ListUserWodResults(ctx context.Context, userID string, limit int) ([]*WodResult, error)
	UpdateWodResult(ctx context.Context, result *WodResult) error
	DeleteWodResult(ctx context.Context, id string) error

	// Leaderboard operations
	GetLeaderboard(ctx context.Context, wodID string, level DifficultyLevel, limit int) ([]*WodResult, error)
}
