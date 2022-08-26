package mysql

import (
	"context"
	"supriadi/entity"
)

type WhatsappRepository interface {
	Send(ctx context.Context, user *entity.WhatsappMessage) (err error)
}
