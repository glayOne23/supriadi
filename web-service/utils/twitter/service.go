package twitter

import (
	"context"

	"github.com/fallenstedt/twitter-stream/rules"
	"github.com/fallenstedt/twitter-stream/stream"
)

type Service interface {
	GetTwitterToken(ctx context.Context) (token string, err error)
	GetTwitterStreamApi(ctx context.Context, token string) stream.IStream
	FetchTweets(ctx context.Context) stream.IStream
	CreateTwitterStreamRule(ctx context.Context, rule string, tag string) (res *rules.TwitterRuleResponse, err error)
}
