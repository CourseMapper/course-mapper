# Course Mapper

[![Build Status](https://travis-ci.com/CourseMapper/course-mapper.svg?branch=dev)](https://travis-ci.com/CourseMapper/course-mapper)

## Running the app

To run the default stack using images from Docker Hub:

```sh
docker-compose up
```

Request e.g. `http://localhost:3000/accounts/createAdmin` to create an initial account "admin". For the (randomly generated) password, check `stdout`.


## Building the image

```sh
docker-compose build
```


## Development setup

### Pre-requisities:

1. MongoDB (running)
2. NodeJS and npm

### Installation

```sh
# Install tools globally
sudo npm install -g bower gulp grunt nodemon

# Install JS modules
npm install
bower install

# Run pre-script compiler
grunt

# Run the app
./bin/www
```
