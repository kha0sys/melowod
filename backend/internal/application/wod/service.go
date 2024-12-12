package wod

import (
	"melowod/backend/internal/domain/model"
)

type Repository interface {
	Create(wod *model.Wod) error
	GetByID(id string) (*model.Wod, error)
	List() ([]*model.Wod, error)
	Update(wod *model.Wod) error
	Delete(id string) error
}

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{
		repo: repo,
	}
}

func (s *Service) CreateWod(wod *model.Wod) error {
	return s.repo.Create(wod)
}

func (s *Service) GetWod(id string) (*model.Wod, error) {
	return s.repo.GetByID(id)
}

func (s *Service) ListWods() ([]*model.Wod, error) {
	return s.repo.List()
}

func (s *Service) UpdateWod(wod *model.Wod) error {
	return s.repo.Update(wod)
}

func (s *Service) DeleteWod(id string) error {
	return s.repo.Delete(id)
}
