package service

import (
	"context"
	"errors"
	"gorm.io/gorm"
	"supriadi/entity"
	"supriadi/exception"
	"supriadi/repository/mysql"
	"supriadi/utils/crypto"
	"time"
)

type AuthService interface {
	SignUp(ctx context.Context, user *entity.User) (err error)
}

type authService struct {
	userRepo       mysql.UserRepository
	locationRepo   mysql.LocationRepository
	cryptoSvc      crypto.Service
	contextTimeout time.Duration
}

func NewAuthService(userRepo mysql.UserRepository, locationRepo mysql.LocationRepository, cryptoSvc crypto.Service, contextTimeout time.Duration) AuthService {
	return &authService{
		userRepo:       userRepo,
		locationRepo:   locationRepo,
		cryptoSvc:      cryptoSvc,
		contextTimeout: contextTimeout,
	}
}

func (s *authService) SignUp(c context.Context, user *entity.User) (err error) {
	ctx, cancel := context.WithTimeout(c, s.contextTimeout)
	defer cancel()

	u, err := s.userRepo.GetBy(ctx, map[string]interface{}{
		"username": user.Username,
	})

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return
	}

	if u.ID != 0 {
		err = exception.NewBadRequestError("username already exist")
		return
	}

	_, err = s.locationRepo.GetBy(ctx, map[string]interface{}{
		"id": user.LocationID,
	})

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			err = exception.NewBadRequestError("location not found")
			return
		}

		return
	}

	passHash, err := s.cryptoSvc.CreatePasswordHash(ctx, user.Password)
	if err != nil {
		return
	}

	user.Password = passHash
	err = s.userRepo.Create(ctx, user)

	user.Password = ""
	return
}
