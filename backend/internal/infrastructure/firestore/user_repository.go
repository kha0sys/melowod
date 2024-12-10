package firestore

import (
	"context"
	"time"

	"cloud.google.com/go/firestore"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/kha0sys/melowod/internal/domain/user"
)

type userRepository struct {
	client *firestore.Client
}

func NewUserRepository(client *firestore.Client) user.Repository {
	return &userRepository{
		client: client,
	}
}

func (r *userRepository) CreateUser(ctx context.Context, u *user.User) error {
	u.CreatedAt = time.Now()
	u.UpdatedAt = time.Now()
	
	_, err := r.client.Collection("users").Doc(u.ID).Set(ctx, u)
	return err
}

func (r *userRepository) GetUser(ctx context.Context, id string) (*user.User, error) {
	doc, err := r.client.Collection("users").Doc(id).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return nil, nil
		}
		return nil, err
	}

	var u user.User
	if err := doc.DataTo(&u); err != nil {
		return nil, err
	}

	return &u, nil
}

func (r *userRepository) UpdateUserStats(ctx context.Context, stats *user.UserStats) error {
	stats.UpdatedAt = time.Now()
	
	_, err := r.client.Collection("user_stats").Doc(stats.UserID).Set(ctx, stats)
	return err
}

func (r *userRepository) GetUserStats(ctx context.Context, userID string) (*user.UserStats, error) {
	doc, err := r.client.Collection("user_stats").Doc(userID).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return nil, nil
		}
		return nil, err
	}

	var stats user.UserStats
	if err := doc.DataTo(&stats); err != nil {
		return nil, err
	}

	return &stats, nil
}

func (r *userRepository) GetGlobalRanking(ctx context.Context, limit int) ([]*user.User, error) {
	var users []*user.User

	docs, err := r.client.Collection("users").
		OrderBy("points", firestore.Desc).
		Limit(limit).
		Documents(ctx).GetAll()

	if err != nil {
		return nil, err
	}

	for _, doc := range docs {
		var u user.User
		if err := doc.DataTo(&u); err != nil {
			return nil, err
		}
		users = append(users, &u)
	}

	return users, nil
}

func (r *userRepository) GetBoxRanking(ctx context.Context, boxName string, limit int) ([]*user.User, error) {
	var users []*user.User

	docs, err := r.client.Collection("users").
		Where("box", "==", boxName).
		OrderBy("points", firestore.Desc).
		Limit(limit).
		Documents(ctx).GetAll()

	if err != nil {
		return nil, err
	}

	for _, doc := range docs {
		var u user.User
		if err := doc.DataTo(&u); err != nil {
			return nil, err
		}
		users = append(users, &u)
	}

	return users, nil
}

func (r *userRepository) AddAchievement(ctx context.Context, userID string, achievementID string) error {
	_, err := r.client.Collection("users").Doc(userID).Update(ctx, []firestore.Update{
		{
			Path:  "achievements",
			Value: firestore.ArrayUnion(achievementID),
		},
	})
	return err
}

func (r *userRepository) ListUserAchievements(ctx context.Context, userID string) ([]*user.Achievement, error) {
	var achievements []*user.Achievement
	
	docs, err := r.client.Collection("achievements").
		Where("userId", "==", userID).
		Documents(ctx).GetAll()
	
	if err != nil {
		return nil, err
	}

	for _, doc := range docs {
		var achievement user.Achievement
		if err := doc.DataTo(&achievement); err != nil {
			return nil, err
		}
		achievements = append(achievements, &achievement)
	}

	return achievements, nil
}

func (r *userRepository) GetLocationRanking(ctx context.Context, country string, city string, limit int) ([]*user.User, error) {
	var users []*user.User

	query := r.client.Collection("users").OrderBy("points", firestore.Desc)
	
	if country != "" {
		query = query.Where("country", "==", country)
		if city != "" {
			query = query.Where("city", "==", city)
		}
	}

	docs, err := query.Limit(limit).Documents(ctx).GetAll()
	if err != nil {
		return nil, err
	}

	for _, doc := range docs {
		var u user.User
		if err := doc.DataTo(&u); err != nil {
			return nil, err
		}
		users = append(users, &u)
	}

	return users, nil
}

func (r *userRepository) ListUsers(ctx context.Context, limit int) ([]*user.User, error) {
	var users []*user.User

	docs, err := r.client.Collection("users").
		Limit(limit).
		Documents(ctx).GetAll()

	if err != nil {
		return nil, err
	}

	for _, doc := range docs {
		var u user.User
		if err := doc.DataTo(&u); err != nil {
			return nil, err
		}
		users = append(users, &u)
	}

	return users, nil
}

func (r *userRepository) UpdateUser(ctx context.Context, u *user.User) error {
	u.UpdatedAt = time.Now()
	_, err := r.client.Collection("users").Doc(u.ID).Set(ctx, u)
	return err
}

func (r *userRepository) DeleteUser(ctx context.Context, id string) error {
	_, err := r.client.Collection("users").Doc(id).Delete(ctx)
	return err
}
