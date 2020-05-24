.PHONY: default build rebuild up start stop test shell clean

default: build test

build:
	@docker-compose build

rebuild:
	@docker-compose build --no-cache

up:
	@docker-compose up --remove-orphans

start:
	@docker-compose up -d --remove-orphans

stop:
	@docker-compose down

test:
	@docker-compose run web npm test

shell:
	@docker-compose run web bash

clean:
	@docker-compose rm -v
