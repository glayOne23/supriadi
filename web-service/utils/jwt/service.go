package jwt

import (
	"context"
	"github.com/golang-jwt/jwt"
)

type Service interface {
	GenerateToken(ctx context.Context, userID int64, location string) (token string, err error)
	ValidateToken(ctx context.Context, tokenString string) (token *jwt.Token, err error)
}
