package entity

import "time"

type Suicidal struct {
	ID               int64     `json:"id"`
	TwitterUsername  string    `json:"twitter_username"`
	TwitterText      string    `json:"twitter_text"`
	TwitterCreatedAt time.Time `json:"twitter_created_at"`
	TwitterLink      string    `json:"twitter_link"`
	LocationID       int64     `json:"location_id"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}
