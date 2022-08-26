package config

import (
	"os"
	"strconv"

	_ "github.com/joho/godotenv/autoload"
)

type Config struct {
	Port                  int
	DatabaseURL           string
	ContextTimeout        int
	TwitterConsumerKey    string
	TwitterConsumerSecret string
}

func Load() (config Config) {
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	databaseURL := os.Getenv("DATABASE_URL")
	contextTimeout, _ := strconv.Atoi(os.Getenv("CONTEXT_TIMEOUT"))
	twitterConsumerKey := os.Getenv("TWITTER_CONSUMER_KEY")
	twitterConsumerSecret := os.Getenv("TWITTER_CONSUMER_SECRET")

	config = Config{
		Port:                  port,
		DatabaseURL:           databaseURL,
		ContextTimeout:        contextTimeout,
		TwitterConsumerKey:    twitterConsumerKey,
		TwitterConsumerSecret: twitterConsumerSecret,
	}

	return
}
