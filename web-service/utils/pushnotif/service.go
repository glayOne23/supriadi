package pushnotif

import (
	"context"
	"fmt"
	"log"
	"supriadi/entity"
	"supriadi/repository/mysql"
	"sync"
)

type NotificationService interface {
	CreateNotificationByLocationID(ctx context.Context, locationID int64, messag string) (err error)
}

type notificationService struct {
	userRepo     mysql.UserRepository
	whatsappRepo WhatsappRepository
}

func NewNotificationService(userRepo mysql.UserRepository, whatsappRepo WhatsappRepository) NotificationService {
	return &notificationService{
		userRepo:     userRepo,
		whatsappRepo: whatsappRepo,
	}
}

func (u *notificationService) CreateNotificationByLocationID(ctx context.Context, locationID int64, message string) (err error) {

	wg := &sync.WaitGroup{}

	users, err := u.userRepo.GetUsersByLocationID(ctx, locationID)
	if err != nil {
		return
	}
	for _, user := range users {

		wg.Add(1)
		go func(wg *sync.WaitGroup, usr entity.User) {
			fmt.Println("send to", usr.Phone)
			err := u.whatsappRepo.Send(ctx, &entity.WhatsappMessage{
				RecepientNumber: usr.Phone,
				Message:         message,
			})

			log.Println(err)

			wg.Done()
		}(wg, user)

	}

	wg.Wait()

	return
}
