package mysql

import (
	"context"
	"supriadi/entity"

	"gorm.io/gorm"
)

type TwilioWhatsAppRepository struct {
}

func NewTwilioRepositoryRepository(db *gorm.DB) WhatsappRepository {
	return &TwilioWhatsAppRepository{}
}

func (wa *TwilioWhatsAppRepository) Send(ctx context.Context, user *entity.WhatsappMessage) (err error) {
	err = nil
	return
}
