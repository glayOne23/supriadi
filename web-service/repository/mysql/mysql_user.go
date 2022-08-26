package mysql

import (
	"context"
	"supriadi/entity"

	"gorm.io/gorm"
)

type UserRepository interface {
	Create(ctx context.Context, user *entity.User) (err error)
}

type mysqlUserRepository struct {
	db *gorm.DB
}

func NewMysqlUserRepository(db *gorm.DB) UserRepository {
	return &mysqlUserRepository{db}
}

func (r *mysqlUserRepository) Create(ctx context.Context, user *entity.User) (err error) {
	err = r.db.WithContext(ctx).Create(user).Error
	return
}
