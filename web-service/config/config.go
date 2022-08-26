package config

import (
	"os"
	"strconv"

	_ "github.com/joho/godotenv/autoload"
)

type Config struct {
	Port           int
	DatabaseURL    string
	ContextTimeout int
}

func Load() (config Config) {
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	databaseURL := os.Getenv("DATABASE_URL")
	contextTimeout, _ := strconv.Atoi(os.Getenv("CONTEXT_TIMEOUT"))

	config = Config{
		Port:           port,
		DatabaseURL:    databaseURL,
		ContextTimeout: contextTimeout,
	}

	return
}
