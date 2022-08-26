package twitter

type Service interface {
	GetTwitterToken() (token string, err error)
}
