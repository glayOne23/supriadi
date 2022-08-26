package classification

import "context"

type Service interface {
	ClassifySuicideTweet(ctx context.Context, text string) (res ClassificationTweetResponse, err error)
}
