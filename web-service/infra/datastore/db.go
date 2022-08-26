package datastore

import (
	"database/sql"
	"fmt"
	"net/url"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func NewDatabase(user, pass, host, port, name string) (gormDB *gorm.DB, err error) {
	connection := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s",
		user, pass, host, port, name,
	)

	val := url.Values{}
	val.Add("parseTime", "1")
	val.Add("loc", "Asia/Jakarta")

	dsn := fmt.Sprintf("%s?%s", connection, val.Encode())

	sqlDB, err := sql.Open("mysql", dsn)
	if err != nil {
		return
	}

	sqlDB.SetConnMaxLifetime(time.Minute * 5)
	sqlDB.SetMaxIdleConns(0)
	sqlDB.SetMaxOpenConns(5)

	gormDB, err = gorm.Open(mysql.New(mysql.Config{
		Conn: sqlDB,
	}), &gorm.Config{})

	return
}
