package datastore

import (
	"database/sql"
	"time"

	"gorm.io/driver/postgres"
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

	gormDB, err = gorm.Open(postgres.New(postgres.Config{
		Conn: sqlDB,
	}), &gorm.Config{})

	return
}
