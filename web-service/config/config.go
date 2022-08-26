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
	ClassificationBaseURL string
	ClassificationApiKey  string
	AdminToken            string
	JwtSecretKey          string
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
	classificationBaseURL := os.Getenv("CLASSIFICATION_BASE_URL")
	classificationApiKey := os.Getenv("CLASSIFICATION_API_KEY")
	adminToken := os.Getenv("ADMIN_TOKEN")
	jwtSecretKey := os.Getenv("JWT_SECRET_KEY")

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
		ClassificationBaseURL: classificationBaseURL,
		ClassificationApiKey:  classificationApiKey,
		AdminToken:            adminToken,
		JwtSecretKey:          jwtSecretKey,
	}

	return
}
