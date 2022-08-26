package http

import (
	"net/http"
	"supriadi/entity"
	"supriadi/exception"
	"supriadi/service"

	"github.com/labstack/echo/v4"
)

type locationHandler struct {
	locationSvc service.LocationService
}

func NewLocationHandler(e *echo.Echo, locationSvc service.LocationService) {
	handler := &locationHandler{
		locationSvc: locationSvc,
	}

	apiV1 := e.Group("/api/v1")
	apiV1.POST("/locations", handler.CreateLocation)
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

	err = location.Validate()
	if err != nil {
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
