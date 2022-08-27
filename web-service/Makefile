ifneq (,$(wildcard ./.env))
    include .env
    export
endif

migration-up:
	migrate -path migration -database "${DATABASE_URL}" up

migration-down:
	migrate -path migration -database "${DATABASE_URL}" down

create-migration:
	migrate create -ext sql -dir migrations -seq $(action)

server:
	go run cmd/api/main.go

worker:
	go run cmd/worker/main.go

.PHONY:
	create-migration
	migration-up
	migration-down
	server
	worker