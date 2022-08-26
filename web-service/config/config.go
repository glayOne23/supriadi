package config

import (
	"os"
	"strconv"

	_ "github.com/joho/godotenv/autoload"
)

type Config struct {
	Port                  int
	DatabaseHost          string
	DatabasePort          string
	DatabaseUser          string
	DatabasePassword      string
	DatabaseName          string
	ContextTimeout        int
	TwitterConsumerKey    string
	TwitterConsumerSecret string
}

func Load() (config Config) {
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	databaseHost := os.Getenv("DATABASE_HOST")
	databasePort := os.Getenv("DATABASE_PORT")
	databaseUser := os.Getenv("DATABASE_USER")
	databasePassword := os.Getenv("DATABASE_PASSWORD")
	databaseName := os.Getenv("DATABASE_NAME")
	contextTimeout, _ := strconv.Atoi(os.Getenv("CONTEXT_TIMEOUT"))
	twitterConsumerKey := os.Getenv("TWITTER_CONSUMER_KEY")
	twitterConsumerSecret := os.Getenv("TWITTER_CONSUMER_SECRET")

	config = Config{
		Port:                  port,
		DatabaseHost:          databaseHost,
		DatabasePort:          databasePort,
		DatabaseUser:          databaseUser,
		DatabasePassword:      databasePassword,
		DatabaseName:          databaseName,
		ContextTimeout:        contextTimeout,
		TwitterConsumerKey:    twitterConsumerKey,
		TwitterConsumerSecret: twitterConsumerSecret,
	}

	return
}
