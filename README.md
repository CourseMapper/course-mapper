# Course Mapper

[![Build Status](https://travis-ci.com/CourseMapper/course-mapper.svg?branch=dev)](https://travis-ci.com/CourseMapper/course-mapper)

## Production setup

To run the default stack using images from Docker Hub:

```sh
docker-compose up
```

Request e.g. `http://localhost:3000/accounts/createAdmin` to create an initial account "admin". For the (randomly generated) password, check `stdout`.


## Development setup

### Requirements

1. MongoDB (installed and running)
2. NodeJS and npm (installed)

### Usage

```sh
# Install tools globally
sudo npm install -g bower gulp grunt nodemon

# Install JS modules
npm install
bower install

# Build front-end JS
grunt

# Run Mocha tests
npm test

# Start web app
./bin/www
```
