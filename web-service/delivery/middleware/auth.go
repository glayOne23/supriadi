package middleware

import (
	"github.com/labstack/echo/v4"
	"net/http"
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
