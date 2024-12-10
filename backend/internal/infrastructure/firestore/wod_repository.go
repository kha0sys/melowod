package firestore

import (
	"context"
	"time"

	"cloud.google.com/go/firestore"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/kha0sys/melowod/internal/domain/wod"
)

type wodRepository struct {
	client *firestore.Client
}

func NewWodRepository(client *firestore.Client) wod.Repository {
	return &wodRepository{
		client: client,
	}
}

func (r *wodRepository) CreateWod(ctx context.Context, w *wod.Wod) error {
	w.CreatedAt = time.Now()
	w.UpdatedAt = time.Now()
	
	_, err := r.client.Collection("wods").Doc(w.ID).Set(ctx, w)
	return err
}

func (r *wodRepository) GetWodByID(ctx context.Context, id string) (*wod.Wod, error) {
	doc, err := r.client.Collection("wods").Doc(id).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return nil, nil
		}
		return nil, err
	}

	var w wod.Wod
	if err := doc.DataTo(&w); err != nil {
		return nil, err
	}

	return &w, nil
}

func (r *wodRepository) GetWodByDate(ctx context.Context, date time.Time) (*wod.Wod, error) {
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	docs, err := r.client.Collection("wods").
		Where("date", ">=", startOfDay).
		Where("date", "<", endOfDay).
		Limit(1).
		Documents(ctx).GetAll()

	if err != nil {
		return nil, err
	}

	if len(docs) == 0 {
		return nil, nil
	}

	var w wod.Wod
	if err := docs[0].DataTo(&w); err != nil {
		return nil, err
	}

	return &w, nil
}

func (r *wodRepository) GetLeaderboard(ctx context.Context, wodID string, level wod.DifficultyLevel, limit int) ([]*wod.WodResult, error) {
	var results []*wod.WodResult

	docs, err := r.client.Collection("wod_results").
		Where("wodId", "==", wodID).
		Where("level", "==", level).
		OrderBy("score", firestore.Desc).
		Limit(limit).
		Documents(ctx).GetAll()

	if err != nil {
		return nil, err
	}

	for _, doc := range docs {
		var result wod.WodResult
		if err := doc.DataTo(&result); err != nil {
			return nil, err
		}
		results = append(results, &result)
	}

	return results, nil
}

func (r *wodRepository) CreateWodResult(ctx context.Context, result *wod.WodResult) error {
	result.CreatedAt = time.Now()
	result.UpdatedAt = time.Now()
	
	_, err := r.client.Collection("wod_results").Doc(result.ID).Set(ctx, result)
	return err
}

func (r *wodRepository) GetWodResult(ctx context.Context, id string) (*wod.WodResult, error) {
	doc, err := r.client.Collection("wod_results").Doc(id).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return nil, nil
		}
		return nil, err
	}

	var result wod.WodResult
	if err := doc.DataTo(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

func (r *wodRepository) ListWodResults(ctx context.Context, wodID string, limit int) ([]*wod.WodResult, error) {
	var results []*wod.WodResult

	docs, err := r.client.Collection("wod_results").
		Where("wodId", "==", wodID).
		OrderBy("score", firestore.Desc).
		Limit(limit).
		Documents(ctx).GetAll()

	if err != nil {
		return nil, err
	}

	for _, doc := range docs {
		var result wod.WodResult
		if err := doc.DataTo(&result); err != nil {
			return nil, err
		}
		results = append(results, &result)
	}

	return results, nil
}

func (r *wodRepository) ListUserWodResults(ctx context.Context, userID string, limit int) ([]*wod.WodResult, error) {
	var results []*wod.WodResult

	docs, err := r.client.Collection("wod_results").
		Where("userId", "==", userID).
		OrderBy("createdAt", firestore.Desc).
		Limit(limit).
		Documents(ctx).GetAll()

	if err != nil {
		return nil, err
	}

	for _, doc := range docs {
		var result wod.WodResult
		if err := doc.DataTo(&result); err != nil {
			return nil, err
		}
		results = append(results, &result)
	}

	return results, nil
}

func (r *wodRepository) UpdateWodResult(ctx context.Context, result *wod.WodResult) error {
	result.UpdatedAt = time.Now()
	_, err := r.client.Collection("wod_results").Doc(result.ID).Set(ctx, result)
	return err
}

func (r *wodRepository) DeleteWodResult(ctx context.Context, id string) error {
	_, err := r.client.Collection("wod_results").Doc(id).Delete(ctx)
	return err
}

func (r *wodRepository) ListWods(ctx context.Context, limit int, startAfter time.Time) ([]*wod.Wod, error) {
	var wods []*wod.Wod

	query := r.client.Collection("wods").
		OrderBy("date", firestore.Desc).
		Limit(limit)

	if !startAfter.IsZero() {
		query = query.StartAfter(startAfter)
	}

	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		return nil, err
	}

	for _, doc := range docs {
		var w wod.Wod
		if err := doc.DataTo(&w); err != nil {
			return nil, err
		}
		wods = append(wods, &w)
	}

	return wods, nil
}

func (r *wodRepository) UpdateWod(ctx context.Context, w *wod.Wod) error {
	w.UpdatedAt = time.Now()
	_, err := r.client.Collection("wods").Doc(w.ID).Set(ctx, w)
	return err
}

func (r *wodRepository) DeleteWod(ctx context.Context, id string) error {
	_, err := r.client.Collection("wods").Doc(id).Delete(ctx)
	return err
}
