package http

import (
	"net/http"
	"supriadi/delivery/middleware"
	"supriadi/entity"
	"supriadi/exception"
	"supriadi/service"

	"github.com/labstack/echo/v4"
)

type locationHandler struct {
	locationSvc service.LocationService
}

func NewLocationHandler(e *echo.Echo, middleware *middleware.Middleware, locationSvc service.LocationService) {
	handler := &locationHandler{
		locationSvc: locationSvc,
	}

	apiV1 := e.Group("/api/v1")
	apiV1.POST("/locations", handler.CreateLocation, middleware.AdminAuth())
	apiV1.GET("/locations", handler.FetchLocation)
}

func (h *locationHandler) CreateLocation(c echo.Context) error {
	ctx := c.Request().Context()

	var location entity.Location
	err := c.Bind(&location)
	if err != nil {
		return c.JSON(
			http.StatusUnprocessableEntity,
			exception.NewUnprocessableEntityError(err.Error()),
		)
	}

	if err = location.Validate(); err != nil {
		return c.JSON(
			http.StatusBadRequest,
			exception.NewBadRequestError("invalid input data"),
		)
	}

	err = h.locationSvc.Create(ctx, &location)
	if err != nil {
		return c.JSON(exception.ParseHttpError(err))
	}

	return c.JSON(http.StatusOK, location)
}

func (h *locationHandler) FetchLocation(c echo.Context) error {
	ctx := c.Request().Context()

	locations, err := h.locationSvc.Fetch(ctx)
	if err != nil {
		return c.JSON(exception.ParseHttpError(err))
	}

	return c.JSON(http.StatusOK, locations)
}
