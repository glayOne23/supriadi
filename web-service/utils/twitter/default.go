package twitter

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

func (s *twitterService) GetTwitterToken() (token string, err error) {
	return
}
