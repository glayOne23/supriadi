package entity

import (
	"time"

	validation "github.com/go-ozzo/ozzo-validation"
)

type Location struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	RuleID    string    `json:"rule_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (l Location) Validate() error {
	return validation.ValidateStruct(
		&l,
		validation.Field(&l.Name, validation.Required),
	)
}
