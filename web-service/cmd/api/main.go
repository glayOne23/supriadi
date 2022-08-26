package main

import (
	"supriadi/config"
	"supriadi/exception"
	"supriadi/infra/datastore"
)

func main() {
	cfg := config.Load()

	_, err := datastore.NewDatabase(cfg.DatabaseURL)
	exception.PanicIfNeeded(err)
}
