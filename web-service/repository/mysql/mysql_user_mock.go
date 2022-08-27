package mysql

import (
	"context"
	"supriadi/entity"

	"github.com/stretchr/testify/mock"
)

type UserRepositoryMock struct {
	mock.Mock
}

func (_m *UserRepositoryMock) GetBy(ctx context.Context, query map[string]interface{}) (user entity.User, err error) {
	//TODO implement me
	panic("implement me")
}

func (_m *UserRepositoryMock) Create(ctx context.Context, user *entity.User) (err error) {
	return
}

func (_m *UserRepositoryMock) GetUsersByLocationID(ctx context.Context, locationID int64) (users []entity.User, err error) {

	ret := _m.Called(ctx, locationID)

	var r0 []entity.User
	if rf, ok := ret.Get(0).(func(context.Context, int64) []entity.User); ok {
		r0 = rf(ctx, locationID)
	} else {
		r0 = ret.Get(0).([]entity.User)
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, int64) error); ok {
		r1 = rf(ctx, locationID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1

}
