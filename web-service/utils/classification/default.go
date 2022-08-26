package classification

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

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

func (s *classificationService) PredictSuicideTweet(ctx context.Context, text string) (resp ClassificationTweetResponse, err error) {

	url := fmt.Sprintf("%s/predict", s.baseURL)
	jsonReq, _ := json.Marshal(map[string]interface{}{
		"tweet": text,
	})

	client := &http.Client{}
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(jsonReq))

	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("X-Api-Key", s.apiKey)

	if err != nil {
		return
	}

	res, err := client.Do(req)
	if err != nil {
		return
	}

	defer res.Body.Close()

	resBody, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return
	}

	if res.StatusCode >= 400 {
		err = fmt.Errorf("the requested url returned status code %d", res.StatusCode)
		return
	}

	err = json.Unmarshal(resBody, &resp)
	return
}
