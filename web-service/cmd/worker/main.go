package main

import (
	"context"
	"encoding/json"
	"fmt"
	"supriadi/config"
	"supriadi/entity"
	"supriadi/exception"
	"supriadi/infra/datastore"
	"supriadi/repository/mysql"
	"supriadi/utils/classification"
	"supriadi/utils/pushnotif"
	"supriadi/utils/translator"
	"supriadi/utils/twitter"
)

func main() {
	fmt.Println("Starting Stream")
	cfg := config.Load()

	dbConn, err := datastore.NewDatabase(
		cfg.DatabaseUser,
		cfg.DatabasePassword,
		cfg.DatabaseHost,
		cfg.DatabasePort,
		cfg.DatabaseName,
	)
	exception.PanicIfNeeded(err)

	ctx := context.Background()

	suicidalRepo := mysql.NewMysqlSuicidalRepository(dbConn)
	locationRepo := mysql.NewMysqlLocationRepository(dbConn)
	userRepo := mysql.NewMysqlUserRepository(dbConn)
	pnRepo := pushnotif.NewWhatsAppWrapperRepository(&pushnotif.WaWrapperConfig{
		Host: cfg.WaWrapperHost},
	)

	twitterSvc := twitter.NewTwitterService(cfg.TwitterConsumerKey, cfg.TwitterConsumerSecret)
	classificationSvc := classification.NewClassificationService(cfg.ClassificationBaseURL, cfg.ClassificationApiKey)
	pnSvc := pushnotif.NewNotificationService(userRepo, pnRepo)
	translatorSvc := translator.NewTranslatorService()

	api := twitterSvc.FetchTweets(ctx)
	for tweet := range api.GetMessages() {
		if tweet.Err != nil {
			fmt.Printf("got error from twitter: %v", tweet.Err)
			api.StopStream()
			continue
		}

		result := tweet.Data.(twitter.StreamResponse)

		go func() {
			translatedTweet, err := translatorSvc.Translate(ctx, result.Data.Text, "id", "en")
			if err != nil {
				fmt.Println(err.Error())
				return
			}

			cls, err := classificationSvc.PredictSuicideTweet(ctx, translatedTweet)
			if err != nil {
				fmt.Println(err.Error())
				return
			}

			if cls.IsSuicide {
				resultStr, _ := json.Marshal(result)
				fmt.Println(string(resultStr))

				loc, err := locationRepo.GetBy(ctx, map[string]interface{}{
					"rule_id": result.MatchingRules[0].ID,
				})

				if err != nil {
					fmt.Println(err.Error())
					return
				}

				pnMessage := fmt.Sprintf(
					"Eh ada yang mau bunuh diri nich https://twitter.com/%s/status/%s",
					result.Includes.Users[0].Username, result.Data.ID)

				go pnSvc.CreateNotificationByLocationID(ctx, loc.ID, pnMessage)

				err = suicidalRepo.Create(ctx, &entity.Suicidal{
					TwitterUsername:  result.Includes.Users[0].Username,
					TwitterText:      result.Data.Text,
					TwitterCreatedAt: result.Data.CreatedAt,
					LocationID:       loc.ID,
				})

				fmt.Println(err.Error())
			}
		}()
	}

	fmt.Println("Stopped Stream")
}
