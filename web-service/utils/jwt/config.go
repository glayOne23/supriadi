package jwt

import "github.com/golang-jwt/jwt"

type jwtCustomClaims struct {
	UserID   int64  `json:"user_id"`
	Location string `json:"location"`
	jwt.StandardClaims
}
