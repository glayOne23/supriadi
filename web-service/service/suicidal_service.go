package service

import (
	"context"
	"supriadi/entity"
	"supriadi/repository/mysql"
	"time"
)

type SuicidalService interface {
	Create(ctx context.Context, suicidal *entity.Suicidal) (err error)
}

type suicidalService struct {
	suicidalRepo   mysql.SuicidalRepository
	contextTimeout time.Duration
}

func NewSuicidalService(suicidalRepo mysql.SuicidalRepository) SuicidalService {
	return &suicidalService{
		suicidalRepo: suicidalRepo,
	}
}

func (s *suicidalService) Create(c context.Context, suicidal *entity.Suicidal) (err error) {
	ctx, cancel := context.WithTimeout(c, s.contextTimeout)
	defer cancel()

	err = s.suicidalRepo.Create(ctx, suicidal)
	return
}
