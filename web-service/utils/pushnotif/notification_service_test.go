package pushnotif

import (
	"context"
	"fmt"
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

func TestSendWhatsappWrapper(t *testing.T) {
	t.Run(" Send to multiple whatsapp numbers", func(t *testing.T) {

		mockUsers := []entity.User{
			entity.User{
				Phone: "6281392944603",
			},
			entity.User{
				Phone: "6281328020250",
			},
		}
		fmt.Println(mockUsers)

		waConfig := WaWrapperConfig{
			Host: "http://54.151.131.192:5000",
		}

		waRepo := NewWhatsAppWrapperRepository(&waConfig)
		mockUserRepo := new(mysql.UserRepositoryMock)

		mockUserRepo.On("GetUsersByLocationID", mock.Anything, mock.Anything).Return(mockUsers, nil).Once()

		useCase := NewNotificationService(mockUserRepo, waRepo)

		err := useCase.CreateNotificationByLocationID(context.Background(), 5, "from unit test 2023")

		log.Println(err)

		assert.Nil(t, err)

	})
}
