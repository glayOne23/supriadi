package pushnotif

import (
	"context"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"supriadi/entity"
)

type WhatsappWrapperRepository struct {
	waWrapperConfig WaWrapperConfig
}

func NewWhatsAppWrapperRepository(config *WaWrapperConfig) WhatsappRepository {
	return &WhatsappWrapperRepository{
		waWrapperConfig: *config,
	}
}

func (wa *WhatsappWrapperRepository) Send(ctx context.Context, msg *entity.WhatsappMessage) (err error) {

	url := fmt.Sprintf("%s/send", wa.waWrapperConfig.Host)
	method := "POST"

	payload := strings.NewReader(fmt.Sprintf(`{"number" : "%s","message": "%s"}`, msg.RecepientNumber, msg.Message))

	client := &http.Client{}
	req, err := http.NewRequest(method, url, payload)

	if err != nil {
		return
	}
	req.Header.Add("Content-Type", "application/json")

	res, err := client.Do(req)
	if err != nil {
		return
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return
	}

	if res.StatusCode != 200 {
		err = errors.New(string(body))
	}

	return
}
