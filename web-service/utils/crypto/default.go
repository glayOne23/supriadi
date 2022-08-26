package crypto

import (
	"context"
	"crypto/md5"
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

const HashingCost int = 4

type cryptoService struct {
	bcryptHashingCost int
}

func NewCryptoService() Service {
	return &cryptoService{
		bcryptHashingCost: HashingCost,
	}
}

func (s *cryptoService) CreatePasswordHash(ctx context.Context, plainPassword string) (hashedPassword string, err error) {
	passwordHashInBytes, err := bcrypt.GenerateFromPassword([]byte(plainPassword), s.bcryptHashingCost)
	if err != nil {
		return
	}

	hashedPassword = string(passwordHashInBytes)
	return
}

func (s *cryptoService) ValidatePassword(ctx context.Context, hashedPassword, plainPassword string) (isValid bool) {
	hashedPasswordInBytes := []byte(hashedPassword)
	plainPasswordInBytes := []byte(plainPassword)
	err := bcrypt.CompareHashAndPassword(hashedPasswordInBytes, plainPasswordInBytes)
	isValid = err == nil
	return
}

func (s *cryptoService) CreateMD5Hash(ctx context.Context, plainText string) (hashedText string) {
	strInByte := []byte(plainText)
	resultInByte := md5.Sum(strInByte)
	hashedText = fmt.Sprintf("%x", resultInByte)
	return
}
