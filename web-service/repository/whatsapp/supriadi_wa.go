package mysql

import (
	"context"
	"supriadi/entity"

	"gorm.io/gorm"
)

type WhatsappWrapperRepository struct {
}

func NewWhatsAppWrapperRepository(db *gorm.DB) WhatsappRepository {
	return &WhatsappWrapperRepository{}
}

func (wa *WhatsappWrapperRepository) Send(ctx context.Context, user *entity.WhatsappMessage) (err error) {
	err = nil
	return
}
