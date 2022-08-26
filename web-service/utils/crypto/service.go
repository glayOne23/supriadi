package crypto

import "context"

type Service interface {
	CreatePasswordHash(ctx context.Context, plainPassword string) (hashedPassword string, err error)
	ValidatePassword(ctx context.Context, hashedPassword, plainPassword string) (isValid bool)
	CreateMD5Hash(ctx context.Context, plainText string) (hashedText string)
}
