.PHONY: default build rebuild start admin test shell clean

default: build test

build:
	@docker-compose build

rebuild:
	@docker-compose build --no-cache

start:
	@docker-compose up

admin:
	@docker-compose run web ./bin/create-admin

test:
	@docker-compose run web npm test

shell:
	@docker-compose run web bash

clean:
	@docker-compose rm -v
