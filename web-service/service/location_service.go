package service

import (
	"context"
	"fmt"
	"strings"
	"supriadi/entity"
	"supriadi/repository/mysql"
	"supriadi/utils/twitter"
	"time"
)

type LocationService interface {
	Create(ctx context.Context, location *entity.Location) (err error)
	Fetch(ctx context.Context) (locations []entity.Location, err error)
}

type locationService struct {
	locationRepo   mysql.LocationRepository
	twitterSvc     twitter.Service
	contextTimeout time.Duration
}

func NewLocationService(locationRepo mysql.LocationRepository, twitterSvc twitter.Service, contextTimeout time.Duration) LocationService {
	return &locationService{
		locationRepo:   locationRepo,
		twitterSvc:     twitterSvc,
		contextTimeout: contextTimeout,
	}
}

func (s *locationService) Create(c context.Context, location *entity.Location) (err error) {
	ctx, cancel := context.WithTimeout(c, s.contextTimeout)
	defer cancel()

	rule := fmt.Sprintf("bio_location:%s -has:mentions", strings.ToLower(location.Name))
	r, err := s.twitterSvc.CreateTwitterStreamRule(ctx, rule, location.Name)
	if err != nil {
		return
	}

	location.RuleID = r.Data[0].Id
	err = s.locationRepo.Create(ctx, location)
	return
}

func (s *locationService) Fetch(c context.Context) (locations []entity.Location, err error) {
	ctx, cancel := context.WithTimeout(c, s.contextTimeout)
	defer cancel()

	locations, err = s.locationRepo.Fetch(ctx)
	return
}
