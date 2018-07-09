.PHONY: default build start test shell clean

default: build test

build:
	@docker-compose build

start:
	@docker-compose up

test:
	@docker-compose run web npm test

shell:
	@docker-compose run web bash

clean:
	@docker-compose rm -v
