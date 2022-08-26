package main

import (
	"context"
	"fmt"
	"supriadi/config"
	"supriadi/entity"
	"supriadi/exception"
	"supriadi/infra/datastore"
	"supriadi/repository/mysql"
	"supriadi/utils/classification"
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

	twitterSvc := twitter.NewTwitterService(cfg.TwitterConsumerKey, cfg.TwitterConsumerSecret)
	classificationSvc := classification.NewClassificationService(cfg.ClassificationBaseURL, cfg.ClassificationApiKey)

	api := twitterSvc.FetchTweets(ctx)
	for tweet := range api.GetMessages() {
		if tweet.Err != nil {
			fmt.Printf("got error from twitter: %v", tweet.Err)
			api.StopStream()
			continue
		}
		result := tweet.Data.(twitter.StreamResponse)

		go func() {
			cls, err := classificationSvc.PredictSuicideTweet(ctx, result.Data.Text)
			if err != nil {
				fmt.Println(err.Error())
				return
			}

			if cls.IsSuicide {
				loc, err := locationRepo.GetBy(ctx, map[string]interface{}{
					"rule_id": result.MatchingRules[0].ID,
				})

				if err != nil {
					fmt.Println(err.Error())
					return
				}

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
