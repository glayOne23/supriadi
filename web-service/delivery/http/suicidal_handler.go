package http

import (
	"github.com/labstack/echo/v4"
	"net/http"
	"supriadi/delivery/middleware"
	"supriadi/entity"
	"supriadi/exception"
	"supriadi/service"
)

type suicidalHandler struct {
	suicidalSvc service.SuicidalService
}

func NewSuicidalHandler(e *echo.Echo, middleware *middleware.Middleware, suicidalSvc service.SuicidalService) {
	handler := &suicidalHandler{
		suicidalSvc: suicidalSvc,
	}

	apiV1 := e.Group("/api/v1")
	apiV1.GET("/suicidals", handler.FetchByUser, middleware.JWTAuth())
}

func (h *suicidalHandler) FetchByUser(c echo.Context) error {
	ctx := c.Request().Context()
	user := c.Get("user").(*entity.User)

	suicidals, err := h.suicidalSvc.FetchByUser(ctx, user.ID)
	if err != nil {
		return c.JSON(exception.ParseHttpError(err))
	}

	return c.JSON(http.StatusOK, suicidals)
}
