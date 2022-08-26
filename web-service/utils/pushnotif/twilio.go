package pushnotif

import (
	"context"
	b64 "encoding/base64"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"supriadi/entity"
)

type TwilioWhatsAppRepository struct {
	twilioConfig TwilioApiConfig
}

func NewTwilioRepositoryRepository(twilioConfig *TwilioApiConfig) WhatsappRepository {
	return &TwilioWhatsAppRepository{
		twilioConfig: *twilioConfig,
	}
}

func (wa *TwilioWhatsAppRepository) Send(ctx context.Context, msg *entity.WhatsappMessage) (err error) {

	url := fmt.Sprintf("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", wa.twilioConfig.AccountSID)
	method := "POST"

	payload := strings.NewReader(
		fmt.Sprintf("From=whatsapp:+%s&Body=%s&To=whatsapp:+%s", wa.twilioConfig.SenderNumber, msg.Message, msg.RecepientNumber),
	)

	client := &http.Client{}
	req, err := http.NewRequest(method, url, payload)

	if err != nil {
		return
	}
	credential := b64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s:%s", wa.twilioConfig.AccountSID, wa.twilioConfig.AuthToken)))
	req.Header.Add("Authorization", fmt.Sprintf("Basic %s", credential))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	res, err := client.Do(req)
	if err != nil {
		return
	}
	defer res.Body.Close()

	_, err = ioutil.ReadAll(res.Body)
	if err != nil {
		return
	}

	return
}
