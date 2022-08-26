package entity

import (
	validation "github.com/go-ozzo/ozzo-validation"
	"time"
)

type User struct {
	ID         int64     `json:"id"`
	Username   string    `json:"username"`
	Password   string    `json:"password"`
	Phone      string    `json:"phone"`
	LocationID int64     `json:"location_id"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (u User) Validate() error {
	return validation.ValidateStruct(
		&u,
		validation.Field(&u.Username, validation.Required),
		validation.Field(&u.Password, validation.Required),
		validation.Field(&u.Phone, validation.Required),
		validation.Field(&u.LocationID, validation.Required),
	)
}
