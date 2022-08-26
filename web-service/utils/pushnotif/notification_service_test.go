package pushnotif

import (
	"context"
	"log"
	"os"
	"supriadi/entity"
	"supriadi/repository/mysql"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestSendWhatsappTwilio(t *testing.T) {
	t.Run(" Send to multiple whatsapp numbers", func(t *testing.T) {

		mockUsers := []entity.User{
			entity.User{
				Phone: "6281392944603",
			},
		}

		twConfig := TwilioApiConfig{
			SenderNumber: "14155238886",
			AccountSID:   os.Getenv("TWILIO_SID"),
			AuthToken:    os.Getenv("TWILIO_AUTH_TOKEN"),
		}

		waRepo := NewTwilioRepositoryRepository(&twConfig)
		mockUserRepo := new(mysql.UserRepositoryMock)

		mockUserRepo.On("GetUsersByLocationID", mock.Anything, mock.Anything).Return(mockUsers, nil).Once()

		useCase := NewNotificationService(mockUserRepo, waRepo)

		err := useCase.CreateNotificationByLocationID(context.Background(), 5, "this is body")

		log.Println(err)

		assert.Nil(t, err)

	})
}
