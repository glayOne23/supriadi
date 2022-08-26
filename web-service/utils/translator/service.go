package translator

import "context"

type Service interface {
	Translate(ctx context.Context, text string, sourceLang string, targetLang string) (result string, err error)
}
