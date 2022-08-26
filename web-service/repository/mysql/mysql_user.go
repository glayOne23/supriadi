package mysql

import (
	"context"
	"supriadi/entity"

	"gorm.io/gorm"
)

type UserRepository interface {
	Create(ctx context.Context, user *entity.User) (err error)
	GetUsersByLocationID(ctx context.Context, locationID int64) (users []entity.User, err error)
}

type mysqlUserRepository struct {
	db *gorm.DB
}

func NewPgsqlAppRepository(db *gorm.DB) UserRepository {
	return &mysqlUserRepository{db}
}

func (r *mysqlUserRepository) Create(ctx context.Context, user *entity.User) (err error) {
	err = r.db.WithContext(ctx).Create(user).Error
	return
}

func (r *mysqlUserRepository) GetUsersByLocationID(ctx context.Context, locationID int64) (users []entity.User, err error) {
	err = r.db.WithContext(ctx).Where("location_id", locationID).Find(&users).Error
	return
}
