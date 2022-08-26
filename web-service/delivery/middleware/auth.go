package middleware

import (
	jwtLib "github.com/golang-jwt/jwt"
	"github.com/labstack/echo/v4"
	"net/http"
	"strings"
	"supriadi/exception"
)

func (m *Middleware) AdminAuth() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			token := c.Request().Header.Get("Authorization")

			if token != m.adminToken {
				return c.JSON(http.StatusUnauthorized, exception.NewUnauthorizedError("invalid admin token"))
			}

			return next(c)
		}
	}
}

func (m *Middleware) JWTAuth() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {

			ctx := c.Request().Context()
			authorizationHeader := c.Request().Header.Get("Authorization")
			bearerToken := strings.Split(authorizationHeader, " ")

			if len(bearerToken) != 2 {
				return c.JSON(http.StatusUnauthorized, exception.NewUnauthorizedError("invalid authorization token"))
			}

			tokenStr := bearerToken[1]
			token, err := m.jwtSvc.ValidateToken(ctx, tokenStr)
			if err != nil {
				return c.JSON(
					http.StatusUnauthorized,
					exception.NewUnauthorizedError("invalid authorization token"),
				)
			}

			if !token.Valid {
				return c.JSON(
					http.StatusUnauthorized,
					exception.NewUnauthorizedError("invalid authorization token"),
				)
			}

			claims := token.Claims.(jwtLib.MapClaims)
			user, err := m.userRepo.GetBy(ctx, map[string]interface{}{
				"id": int64(claims["user_id"].(float64)),
			})

			if err != nil {
				return c.JSON(
					http.StatusUnauthorized,
					exception.NewUnauthorizedError("invalid authorization token"),
				)
			}

			c.Set("user", &user)
			return next(c)
		}
	}
}
