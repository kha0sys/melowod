package firestore

import (
	"context"
	"time"

	"melowod/backend/internal/domain/model"

	"cloud.google.com/go/firestore"
)

type WodRepository struct {
	client *firestore.Client
}

func NewWodRepository(client *firestore.Client) *WodRepository {
	return &WodRepository{
		client: client,
	}
}

func (r *WodRepository) Create(wod *model.Wod) error {
	ctx := context.Background()
	
	// Si no hay ID, generamos uno
	if wod.ID == "" {
		ref := r.client.Collection("wods").NewDoc()
		wod.ID = ref.ID
	}

	wod.CreatedAt = time.Now()
	wod.UpdatedAt = time.Now()

	_, err := r.client.Collection("wods").Doc(wod.ID).Set(ctx, wod)
	return err
}

func (r *WodRepository) GetByID(id string) (*model.Wod, error) {
	ctx := context.Background()
	
	doc, err := r.client.Collection("wods").Doc(id).Get(ctx)
	if err != nil {
		return nil, err
	}

	var w model.Wod
	err = doc.DataTo(&w)
	if err != nil {
		return nil, err
	}

	return &w, nil
}

func (r *WodRepository) List() ([]*model.Wod, error) {
	ctx := context.Background()
	
	iter := r.client.Collection("wods").Documents(ctx)
	var wods []*model.Wod

	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}

		var w model.Wod
		err = doc.DataTo(&w)
		if err != nil {
			return nil, err
		}

		wods = append(wods, &w)
	}

	return wods, nil
}

func (r *WodRepository) Update(wod *model.Wod) error {
	ctx := context.Background()
	
	wod.UpdatedAt = time.Now()
	
	_, err := r.client.Collection("wods").Doc(wod.ID).Set(ctx, wod)
	return err
}

func (r *WodRepository) Delete(id string) error {
	ctx := context.Background()
	
	_, err := r.client.Collection("wods").Doc(id).Delete(ctx)
	return err
}
