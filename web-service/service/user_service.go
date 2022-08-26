package service

import (
	"context"
	"supriadi/entity"
	"supriadi/repository/mysql"
)

type UserService interface {
	Create(ctx context.Context, user *entity.User) (err error)
}

type userService struct {
	userRepo mysql.UserRepository
}

func NewUserService(userRepo mysql.UserRepository) UserService {
	return &userService{
		userRepo: userRepo,
	}
}

func (s *userService) Create(ctx context.Context, user *entity.User) (err error) {
	return
}
