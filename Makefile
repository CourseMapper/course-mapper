.PHONY: default build start admin clean shell

default: build start

build:
	@docker-compose build

start:
	@docker-compose up

clean:
	@docker-compose rm -v

shell:
	@docker-compose run web bash
