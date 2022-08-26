package mysql

import (
	"context"
	"supriadi/entity"
)

type WhatsappRepository interface {
	Send(ctx context.Context, msg *entity.WhatsappMessage) (err error)
}
