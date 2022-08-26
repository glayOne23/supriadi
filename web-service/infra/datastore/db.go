package datastore

import (
	"database/sql"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func NewDatabase(dsn string) (gormDB *gorm.DB, err error) {
	sqlDB, err := sql.Open("pgx", dsn)
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
