package application

import (
	"context"
	"errors"
	"time"

	"github.com/kha0sys/melowod/internal/domain/user"
)

var (
	ErrUserAlreadyExists = errors.New("user already exists")
)

type UserService struct {
	userRepo user.Repository
}

func NewUserService(userRepo user.Repository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

func (s *UserService) CreateUser(ctx context.Context, u *user.User) error {
	existingUser, err := s.userRepo.GetUser(ctx, u.ID)
	if err != nil {
		return err
	}
	if existingUser != nil {
		return ErrUserAlreadyExists
	}

	// Inicializar campos por defecto
	u.Points = 0
	u.WodCount = 0
	u.Achievements = make([]string, 0)
	u.CreatedAt = time.Now()
	u.UpdatedAt = time.Now()

	if err := s.userRepo.CreateUser(ctx, u); err != nil {
		return err
	}

	// Crear estadísticas iniciales
	stats := &user.UserStats{
		UserID:           u.ID,
		TotalWods:       0,
		TotalPoints:     0,
		ConsecutiveDays: 0,
		LastWorkoutDate: time.Time{},
		UpdatedAt:       time.Now(),
	}

	return s.userRepo.UpdateUserStats(ctx, stats)
}

func (s *UserService) GetUser(ctx context.Context, id string) (*user.User, error) {
	return s.userRepo.GetUser(ctx, id)
}

func (s *UserService) GetUserStats(ctx context.Context, userID string) (*user.UserStats, error) {
	return s.userRepo.GetUserStats(ctx, userID)
}

func (s *UserService) GetGlobalRanking(ctx context.Context, limit int) ([]*user.User, error) {
	return s.userRepo.GetGlobalRanking(ctx, limit)
}

func (s *UserService) GetBoxRanking(ctx context.Context, boxName string, limit int) ([]*user.User, error) {
	return s.userRepo.GetBoxRanking(ctx, boxName, limit)
}

func (s *UserService) GetLocationRanking(ctx context.Context, country, city string, limit int) ([]*user.User, error) {
	return s.userRepo.GetLocationRanking(ctx, country, city, limit)
}

func (s *UserService) AddAchievement(ctx context.Context, userID string, achievementID string) error {
	return s.userRepo.AddAchievement(ctx, userID, achievementID)
}
