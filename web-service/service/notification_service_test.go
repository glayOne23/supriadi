package service

import (
	"context"
	"supriadi/config"
	"supriadi/entity"
	"supriadi/repository/mysql"
	whatsapp_repo "supriadi/repository/whatsapp"
	"testing"

	"github.com/stretchr/testify/mock"
)

func TestSendWhatsappTwilio(t *testing.T) {
	t.Run(" Send to multiple whatsapp numbers", func(t *testing.T) {

		mockUsers := []entity.User{
			entity.User{
				Phone: "6281392944603",
			},
		}

		twConfig := config.TwilioApiConfig{
			SenderNumber: "14155238886",
			AccountSID:   "ACf2383e6334abe775c67626973e09f657",
			AuthToken:    "06e113b32c2c2cae8f04747ad7bec0e2",
		}

		waRepo := whatsapp_repo.NewTwilioRepositoryRepository(&twConfig)
		mockUserRepo := new(mysql.UserRepositoryMock)

		mockUserRepo.On("GetUsersByLocationID", mock.Anything, mock.Anything).Return(mockUsers, nil).Once()

		useCase := NewNotificationService(mockUserRepo, waRepo)

		useCase.CreateNotificationByLocationID(context.Background(), 5, "this is body")

	})
}
