package application

import (
	"context"
	"errors"
	"time"

	"github.com/kha0sys/melowod/internal/domain/wod"
	"github.com/kha0sys/melowod/internal/domain/user"
)

var (
	ErrWodAlreadyExists = errors.New("wod already exists for this date")
	ErrWodNotFound      = errors.New("wod not found")
	ErrUserNotFound     = errors.New("user not found")
)

type WodService struct {
	wodRepo  wod.Repository
	userRepo user.Repository
}

func NewWodService(wodRepo wod.Repository, userRepo user.Repository) *WodService {
	return &WodService{
		wodRepo:  wodRepo,
		userRepo: userRepo,
	}
}

func (s *WodService) CreateDailyWod(ctx context.Context, wod *wod.Wod) error {
	// Validar que no exista un WOD para la fecha
	existingWod, err := s.wodRepo.GetWodByDate(ctx, wod.Date)
	if err != nil {
		return err
	}
	if existingWod != nil {
		return ErrWodAlreadyExists
	}

	return s.wodRepo.CreateWod(ctx, wod)
}

func (s *WodService) SubmitWodResult(ctx context.Context, result *wod.WodResult) error {
	// Validar que el WOD existe
	wodExists, err := s.wodRepo.GetWodByID(ctx, result.WodID)
	if err != nil {
		return err
	}
	if wodExists == nil {
		return ErrWodNotFound
	}

	// Validar que el usuario existe
	userExists, err := s.userRepo.GetUser(ctx, result.UserID)
	if err != nil {
		return err
	}
	if userExists == nil {
		return ErrUserNotFound
	}

	// Crear el resultado
	if err := s.wodRepo.CreateWodResult(ctx, result); err != nil {
		return err
	}

	// Actualizar estadísticas del usuario
	stats, err := s.userRepo.GetUserStats(ctx, result.UserID)
	if err != nil {
		return err
	}

	if stats == nil {
		stats = &user.UserStats{
			UserID:          result.UserID,
			TotalWods:      1,
			LastWorkoutDate: time.Now(),
		}
	} else {
		stats.TotalWods++
		stats.LastWorkoutDate = time.Now()
		
		// Calcular días consecutivos
		if time.Since(stats.LastWorkoutDate) < 24*time.Hour {
			stats.ConsecutiveDays++
		} else {
			stats.ConsecutiveDays = 1
		}
	}

	return s.userRepo.UpdateUserStats(ctx, stats)
}

func (s *WodService) GetWodByDate(ctx context.Context, date time.Time) (*wod.Wod, error) {
	return s.wodRepo.GetWodByDate(ctx, date)
}

func (s *WodService) GetLeaderboard(ctx context.Context, wodID string, level wod.DifficultyLevel, limit int) ([]*wod.WodResult, error) {
	return s.wodRepo.GetLeaderboard(ctx, wodID, level, limit)
}

func (s *WodService) GetUserWodHistory(ctx context.Context, userID string, limit int) ([]*wod.WodResult, error) {
	return s.wodRepo.ListUserWodResults(ctx, userID, limit)
}
