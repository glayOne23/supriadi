package classification

import "context"

type Service interface {
	PredictSuicideTweet(ctx context.Context, text string) (resp ClassificationTweetResponse, err error)
}
