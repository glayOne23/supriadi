package classification

type ClassificationTweetResponse struct {
	Status    int    `json:"status"`
	IsSuicide bool   `json:"is_suicide"`
	Message   string `json:"message"`
}
