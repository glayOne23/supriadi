package pushnotif

import (
	"context"
	b64 "encoding/base64"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
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

	apiUrl := fmt.Sprintf("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", wa.twilioConfig.AccountSID)
	method := "POST"

	fromNumber := url.QueryEscape(fmt.Sprintf("whatsapp:+%s", wa.twilioConfig.SenderNumber))
	toNumber := url.QueryEscape(fmt.Sprintf("whatsapp:+%s", msg.RecepientNumber))
	msgBody := url.QueryEscape(msg.Message)

	payload := strings.NewReader(
		fmt.Sprintf("From=%s&Body=%s&To=%s", fromNumber, msgBody, toNumber),
	)

	client := &http.Client{}
	req, err := http.NewRequest(method, apiUrl, payload)

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

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return
	}

	if res.StatusCode != 200 {
		return errors.New(fmt.Sprintf("Twilio API Failed %s", string(body)))
	}

	return
}
