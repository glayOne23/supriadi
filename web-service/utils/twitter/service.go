package twitter

import (
	"context"

	"github.com/fallenstedt/twitter-stream/stream"
)

type Service interface {
	GetTwitterToken(ctx context.Context) (token string, err error)
	GetTwitterStreamApi(ctx context.Context, token string) stream.IStream
	FetchTweets(ctx context.Context) stream.IStream
}
