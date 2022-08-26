package twitter

import (
	"context"
	"encoding/json"
	"fmt"

	twitterstream "github.com/fallenstedt/twitter-stream"
	"github.com/fallenstedt/twitter-stream/stream"
)

type twitterService struct {
	consumerKey    string
	consumerSecret string
}

func NewTwitterService(consumerKey, consumerSecret string) Service {
	return &twitterService{
		consumerKey:    consumerKey,
		consumerSecret: consumerSecret,
	}
}

func (s *twitterService) GetTwitterToken(ctx context.Context) (token string, err error) {
	tok, err := twitterstream.NewTokenGenerator().
		SetApiKeyAndSecret(s.consumerKey, s.consumerSecret).
		RequestBearerToken()

	if err != nil {
		return
	}

	token = tok.AccessToken
	return
}

func (s *twitterService) GetTwitterStreamApi(ctx context.Context, token string) stream.IStream {
	return twitterstream.NewTwitterStream(token).Stream
}

func (s *twitterService) FetchTweets(ctx context.Context) stream.IStream {
	tok, err := s.GetTwitterToken(ctx)
	if err != nil {
		panic(err)
	}

	api := s.GetTwitterStreamApi(ctx, tok)
	api.SetUnmarshalHook(func(bytes []byte) (interface{}, error) {
		data := StreamResponse{}
		if err := json.Unmarshal(bytes, &data); err != nil {
			fmt.Printf("failed to unmarshal bytes: %v", err)
		}
		return data, err
	})

	streamExpansions := twitterstream.NewStreamQueryParamsBuilder().
		AddExpansion("author_id").
		AddTweetField("created_at").
		Build()

	err = api.StartStream(streamExpansions)
	if err != nil {
		panic(err)
	}

	return api
}
