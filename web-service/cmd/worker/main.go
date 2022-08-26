package main

import (
	"encoding/json"
	"fmt"
	"os"
	"time"

	twitterstream "github.com/fallenstedt/twitter-stream"
	"github.com/fallenstedt/twitter-stream/stream"
)

func main() {
	initiateStream()
}

type StreamResponse struct {
	Data struct {
		Text      string    `json:"text"`
		ID        string    `json:"id"`
		CreatedAt time.Time `json:"created_at"`
		AuthorID  string    `json:"author_id"`
	} `json:"data"`
	Includes struct {
		Users []struct {
			ID       string `json:"id"`
			Name     string `json:"name"`
			Username string `json:"username"`
		} `json:"users"`
	} `json:"includes"`
	MatchingRules []struct {
		ID  string `json:"id"`
		Tag string `json:"tag"`
	} `json:"matching_rules"`
}

// This will run forever
func initiateStream() {
	fmt.Println("Starting Stream")

	// Start the stream
	// And return the library's api
	api := fetchTweets()

	// When the loop below ends, restart the stream
	defer initiateStream()

	// Start processing data from twitter
	for tweet := range api.GetMessages() {

		// Handle disconnections from twitter
		// https://developer.twitter.com/en/docs/twitter-api/tweets/volume-streams/integrate/handling-disconnections
		if tweet.Err != nil {
			fmt.Printf("got error from twitter: %v", tweet.Err)

			// Notice we "StopStream" and then "continue" the loop instead of breaking.
			// StopStream will close the long running GET request to Twitter's v2 Streaming endpoint by
			// closing the `GetMessages` channel. Once it's closed, it's safe to perform a new network request
			// with `StartStream`
			api.StopStream()
			continue
		}
		result := tweet.Data.(StreamResponse)

		// Here I am printing out the text.
		// You can send this off to a queue for processing.
		// Or do your processing here in the loop
		fmt.Println(result.Includes.Users[0].Username, result.Data.Text)
	}

	fmt.Println("Stopped Stream")
}

func fetchTweets() stream.IStream {
	// Get Bearer Token using API keys
	tok, err := getTwitterToken()
	if err != nil {
		panic(err)
	}

	// Instantiate an instance of twitter stream using the bearer token
	api := getTwitterStreamApi(tok)

	// On Each tweet, decode the bytes into a StreamDataExample struct
	api.SetUnmarshalHook(func(bytes []byte) (interface{}, error) {
		data := StreamResponse{}
		if err := json.Unmarshal(bytes, &data); err != nil {
			fmt.Printf("failed to unmarshal bytes: %v", err)
		}
		return data, err
	})

	// Request additional data from teach tweet
	streamExpansions := twitterstream.NewStreamQueryParamsBuilder().
		AddExpansion("author_id").
		AddTweetField("created_at").
		Build()

	// Start the Stream
	err = api.StartStream(streamExpansions)
	if err != nil {
		panic(err)
	}

	// Return the twitter stream api instance
	return api
}

func getTwitterToken() (string, error) {
	tok, err := twitterstream.NewTokenGenerator().
		SetApiKeyAndSecret(os.Getenv("TWITTER_CONSUMER_KEY"), os.Getenv("TWITTER_CONSUMER_SECRET")).
		RequestBearerToken()

	return tok.AccessToken, err
}

func getTwitterStreamApi(tok string) stream.IStream {
	return twitterstream.NewTwitterStream(tok).Stream
}
