package main

import (
	"context"
	"fmt"
	"supriadi/config"
	"supriadi/utils/twitter"
)

func main() {
	fmt.Println("Starting Stream")
	cfg := config.Load()

	ctx := context.Background()
	twitterSvc := twitter.NewTwitterService(cfg.TwitterConsumerKey, cfg.TwitterConsumerSecret)

	api := twitterSvc.FetchTweets(ctx)
	for tweet := range api.GetMessages() {
		if tweet.Err != nil {
			fmt.Printf("got error from twitter: %v", tweet.Err)
			api.StopStream()
			continue
		}
		result := tweet.Data.(twitter.StreamResponse)
		fmt.Println(result.Includes.Users[0].Username, result.Data.Text)
	}

	fmt.Println("Stopped Stream")
}
