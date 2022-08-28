package mysql

import (
	"context"
	"supriadi/entity"

	"gorm.io/gorm"
)

type SuicidalRepository interface {
	Create(ctx context.Context, suicidal *entity.Suicidal) (err error)
	FetchBy(ctx context.Context, query map[string]interface{}) (suicidals []entity.Suicidal, err error)
}

type mysqlSuicidalRepository struct {
	db *gorm.DB
}

func NewMysqlSuicidalRepository(db *gorm.DB) SuicidalRepository {
	return &mysqlSuicidalRepository{
		db: db,
	}
}

func (r *mysqlSuicidalRepository) Create(ctx context.Context, suicidal *entity.Suicidal) (err error) {
	err = r.db.WithContext(ctx).Create(suicidal).Error
	return
}

func (r *mysqlSuicidalRepository) FetchBy(ctx context.Context, query map[string]interface{}) (suicidals []entity.Suicidal, err error) {
	err = r.db.WithContext(ctx).Where(query).Order("created_at ASC").Find(&suicidals).Error
	return
}
