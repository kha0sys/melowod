package user

import (
	"context"
)

type Repository interface {
	// User operations
	CreateUser(ctx context.Context, user *User) error
	GetUser(ctx context.Context, id string) (*User, error)
	UpdateUser(ctx context.Context, user *User) error
	DeleteUser(ctx context.Context, id string) error
	ListUsers(ctx context.Context, limit int) ([]*User, error)

	// Stats operations
	GetUserStats(ctx context.Context, userID string) (*UserStats, error)
	UpdateUserStats(ctx context.Context, stats *UserStats) error

	// Achievement operations
	AddAchievement(ctx context.Context, userID string, achievementID string) error
	ListUserAchievements(ctx context.Context, userID string) ([]*Achievement, error)
	
	// Ranking operations
	GetGlobalRanking(ctx context.Context, limit int) ([]*User, error)
	GetBoxRanking(ctx context.Context, boxName string, limit int) ([]*User, error)
	GetLocationRanking(ctx context.Context, country string, city string, limit int) ([]*User, error)
}
