package main

import (
	"fmt"
	"supriadi/config"
	"supriadi/exception"
	"supriadi/infra/datastore"
	"supriadi/repository/mysql"
	"supriadi/service"
	"supriadi/utils/crypto"
	"supriadi/utils/twitter"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	httpDelivery "supriadi/delivery/http"
	appMiddleware "supriadi/delivery/middleware"
)

func main() {
	cfg := config.Load()

	dbConn, err := datastore.NewDatabase(
		cfg.DatabaseUser,
		cfg.DatabasePassword,
		cfg.DatabaseHost,
		cfg.DatabasePort,
		cfg.DatabaseName,
	)
	exception.PanicIfNeeded(err)

	locationRepo := mysql.NewMysqlLocationRepository(dbConn)
	userRepo := mysql.NewMysqlUserRepository(dbConn)

	twitterSvc := twitter.NewTwitterService(cfg.TwitterConsumerKey, cfg.TwitterConsumerSecret)
	cryptoSvc := crypto.NewCryptoService()

	ctxTimeout := time.Duration(cfg.ContextTimeout) * time.Second
	locationSvc := service.NewLocationService(locationRepo, twitterSvc, ctxTimeout)
	authSvc := service.NewAuthService(userRepo, locationRepo, cryptoSvc, ctxTimeout)

	appMidd := appMiddleware.NewMiddleware(cfg.AdminToken)

	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.RequestID())
	e.Use(middleware.CORS())
	e.Use(middleware.Recover())

	httpDelivery.NewLocationHandler(e, appMidd, locationSvc)
	httpDelivery.NewAuthHandler(e, appMidd, authSvc)

	address := fmt.Sprintf(":%v", cfg.Port)
	e.Logger.Fatal(e.Start(address))

}
