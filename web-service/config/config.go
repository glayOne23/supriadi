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
	ClassificationBaseURL string
	ClassificationApiKey  string
	AdminToken            string
	JwtSecretKey          string
	WaWrapperHost         string
}

func Load() (config Config) {
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	databaseURL := os.Getenv("DATABASE_URL")
	contextTimeout, _ := strconv.Atoi(os.Getenv("CONTEXT_TIMEOUT"))
	twitterConsumerKey := os.Getenv("TWITTER_CONSUMER_KEY")
	twitterConsumerSecret := os.Getenv("TWITTER_CONSUMER_SECRET")
	classificationBaseURL := os.Getenv("CLASSIFICATION_BASE_URL")
	classificationApiKey := os.Getenv("CLASSIFICATION_API_KEY")
	adminToken := os.Getenv("ADMIN_TOKEN")
	jwtSecretKey := os.Getenv("JWT_SECRET_KEY")
	waWrapperHost := os.Getenv("WA_WRAPPER_HOST")

	config = Config{
		Port:                  port,
		DatabaseURL:           databaseURL,
		ContextTimeout:        contextTimeout,
		TwitterConsumerKey:    twitterConsumerKey,
		TwitterConsumerSecret: twitterConsumerSecret,
		ClassificationBaseURL: classificationBaseURL,
		ClassificationApiKey:  classificationApiKey,
		AdminToken:            adminToken,
		JwtSecretKey:          jwtSecretKey,
		WaWrapperHost:         waWrapperHost,
	}

	return
}
