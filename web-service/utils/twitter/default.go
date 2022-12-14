package twitter

import (
	"context"
	"encoding/json"
	"fmt"

	twitterstream "github.com/fallenstedt/twitter-stream"
	"github.com/fallenstedt/twitter-stream/rules"
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

func (s *twitterService) FetchTweets(ctx context.Context) (api stream.IStream, err error) {
	tok, err := s.GetTwitterToken(ctx)
	if err != nil {
		return
	}

	api = twitterstream.NewTwitterStream(tok).Stream
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
	return
}

func (s *twitterService) CreateTwitterStreamRule(ctx context.Context, rule string, tag string) (res *rules.TwitterRuleResponse, err error) {
	tok, err := s.GetTwitterToken(ctx)
	if err != nil {
		return
	}

	api := twitterstream.NewTwitterStream(tok)
	rules := twitterstream.NewRuleBuilder().AddRule(rule, tag).Build()

	res, err = api.Rules.Create(rules, false)
	if err != nil {
		return
	}

	if res.Errors != nil && len(res.Errors) > 0 {
		err = fmt.Errorf("received an error from twitter: %v", res.Errors)
		return
	}

	return
}
