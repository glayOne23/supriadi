package mysql

import (
	"context"
	"supriadi/entity"

	"gorm.io/gorm"
)

type LocationRepository interface {
	Create(ctx context.Context, location *entity.Location) (err error)
}

type mysqlLocationRepository struct {
	db *gorm.DB
}

func NewMysqlLocationRepository(db *gorm.DB) LocationRepository {
	return &mysqlLocationRepository{db: db}
}

func (r *mysqlLocationRepository) Create(ctx context.Context, location *entity.Location) (err error) {
	err = r.db.WithContext(ctx).Create(location).Error
	return
}
