package translator

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/robertkrimen/otto"
	"io/ioutil"
	"net/http"
	"strings"
)

type translatorService struct {
}

func NewTranslatorService() Service {
	return &translatorService{}
}

func encodeURI(s string) (res string, err error) {
	eUri := `eUri = encodeURI(sourceText);`
	vm := otto.New()
	if err = vm.Set("sourceText", s); err != nil {
		return
	}
	if _, err = vm.Run(eUri); err != nil {
		return
	}

	val, err := vm.Get("eUri")
	if err != nil {
		return
	}

	res, err = val.ToString()
	return
}

func (s *translatorService) Translate(ctx context.Context, source string, sourceLang string, targetLang string) (translated string, err error) {
	var text []string
	var result []interface{}

	encodedSource, err := encodeURI(source)
	if err != nil {
		return
	}
	url := "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
		sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodedSource

	r, err := http.Get(url)
	if err != nil {
		return
	}
	defer r.Body.Close()

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		return
	}

	bReq := strings.Contains(string(body), `<title>Error 400 (Bad Request)`)
	if bReq {
		err = errors.New("error 400 (Bad Request)")
		return
	}

	err = json.Unmarshal(body, &result)
	if err != nil {
		return
	}

	if len(result) == 0 {
		err = errors.New("no translated data in response")
		return
	}

	inner := result[0]
	for _, slice := range inner.([]interface{}) {
		for _, translatedText := range slice.([]interface{}) {
			text = append(text, fmt.Sprintf("%v", translatedText))
			break
		}
	}

	translated = strings.Join(text, "")
	return
}
