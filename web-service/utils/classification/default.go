package classification

import "context"

type classificationService struct {
	baseURL string
	apiKey  string
}

func NewClassificationService(baseURL, apiKey string) Service {
	return &classificationService{
		baseURL: baseURL,
		apiKey:  apiKey,
	}
}

func (s *classificationService) ClassifySuicideTweet(ctx context.Context, text string) (res ClassificationTweetResponse, err error) {
	return
}
