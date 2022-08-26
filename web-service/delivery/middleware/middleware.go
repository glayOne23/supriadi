package middleware

import (
	"supriadi/repository/mysql"
	"supriadi/utils/jwt"
)

type Middleware struct {
	adminToken string
	jwtSvc     jwt.Service
	userRepo   mysql.UserRepository
}

func NewMiddleware(adminToken string, jwtSvc jwt.Service, userRepo mysql.UserRepository) *Middleware {
	return &Middleware{
		adminToken: adminToken,
		jwtSvc:     jwtSvc,
		userRepo:   userRepo,
	}
}
