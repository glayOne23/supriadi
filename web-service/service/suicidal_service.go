package service

import (
	"context"
	"supriadi/entity"
	"supriadi/repository/mysql"
	"time"
)

type SuicidalService interface {
	Create(ctx context.Context, suicidal *entity.Suicidal) (err error)
	FetchByUser(ctx context.Context, userID int64) (suicidals []entity.Suicidal, err error)
}

type suicidalService struct {
	suicidalRepo   mysql.SuicidalRepository
	userRepo       mysql.UserRepository
	contextTimeout time.Duration
}

func NewSuicidalService(suicidalRepo mysql.SuicidalRepository, userRepo mysql.UserRepository, contextTimeout time.Duration) SuicidalService {
	return &suicidalService{
		suicidalRepo:   suicidalRepo,
		userRepo:       userRepo,
		contextTimeout: contextTimeout,
	}
}

func (s *suicidalService) Create(c context.Context, suicidal *entity.Suicidal) (err error) {
	ctx, cancel := context.WithTimeout(c, s.contextTimeout)
	defer cancel()

	err = s.suicidalRepo.Create(ctx, suicidal)
	return
}

func (s *suicidalService) FetchByUser(c context.Context, userID int64) (suicidals []entity.Suicidal, err error) {
	ctx, cancel := context.WithTimeout(c, s.contextTimeout)
	defer cancel()

	user, err := s.userRepo.GetBy(ctx, map[string]interface{}{
		"id": userID,
	})

	if err != nil {
		return
	}

	suicidals, err = s.suicidalRepo.FetchBy(ctx, map[string]interface{}{
		"location_id": user.LocationID,
	})
	return
}
