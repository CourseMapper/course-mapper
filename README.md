# Course Mapper

## Run via docker-compose

To run the default stack using images from Docker Hub:

```sh
docker-compose up
```

Request e.g. `http://localhost:3000/accounts/createAdmin` to create an initial account "admin". For the (randomly generated) password, check `stdout`.


## Run on Kubernetes

Prepare `./kustomization.yaml` (include `./k8s` as base, configure NS, labels, etc.) and deploy:

```sh
kubectl apply -k .
```

Check that all resources are deployed and the deployment are ready:

```sh
kubectl get -k .
```

Request `/accounts/createAdmin` to create an initial account "admin". For the (randomly generated) password, check the logs, e.g.:

```sh
kubectl logs \
  --selector app=course-mapper,component=web \
  --namespace default
```


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
or nodemon
```
