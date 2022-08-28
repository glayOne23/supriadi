package mysql

import (
	"context"
	"supriadi/entity"

	"gorm.io/gorm"
)

type LocationRepository interface {
	Create(ctx context.Context, location *entity.Location) (err error)
	GetBy(ctx context.Context, query map[string]interface{}) (location entity.Location, err error)
	Fetch(ctx context.Context) (locations []entity.Location, err error)
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

func (r *mysqlLocationRepository) GetBy(ctx context.Context, query map[string]interface{}) (location entity.Location, err error) {
	err = r.db.WithContext(ctx).Where(query).First(&location).Error
	return
}

func (r *mysqlLocationRepository) Fetch(ctx context.Context) (locations []entity.Location, err error) {
	err = r.db.WithContext(ctx).Find(&locations).Order("created_at ASC").Error
	return
}
