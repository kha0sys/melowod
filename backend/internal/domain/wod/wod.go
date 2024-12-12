package wod

import "time"

type Wod struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Date        time.Time `json:"date"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Repository interface {
	Create(wod *Wod) error
	GetByID(id string) (*Wod, error)
	List() ([]*Wod, error)
	Update(wod *Wod) error
	Delete(id string) error
}
