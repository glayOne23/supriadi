package http

import (
	validation "github.com/go-ozzo/ozzo-validation"
	"github.com/labstack/echo/v4"
	"net/http"
	"supriadi/delivery/middleware"
	"supriadi/entity"
	"supriadi/exception"
	"supriadi/service"
)

type authHandler struct {
	authSvc service.AuthService
}

func NewAuthHandler(e *echo.Echo, middleware *middleware.Middleware, authSvc service.AuthService) {
	handler := &authHandler{
		authSvc: authSvc,
	}

	apiV1 := e.Group("/api/v1")
	apiV1.POST("/auth/signup", handler.Signup)
}

func (h *authHandler) Signup(c echo.Context) error {
	ctx := c.Request().Context()

	var user entity.User
	err := c.Bind(&user)
	if err != nil {
		return c.JSON(
			http.StatusUnprocessableEntity,
			exception.NewUnprocessableEntityError(err.Error()),
		)
	}

	if err = user.Validate(); err != nil {
		errVal := err.(validation.Errors)
		return c.JSON(
			http.StatusBadRequest,
			exception.NewInvalidInputError(errVal),
		)
	}

	err = h.authSvc.SignUp(ctx, &user)
	if err != nil {
		return c.JSON(exception.ParseHttpError(err))
	}

	return c.JSON(http.StatusOK, user)
}
