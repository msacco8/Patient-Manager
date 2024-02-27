# Aura Take Home - Michael Sacco

This repository contains a Node/Express backend that communicates with MongoDB to store patient data that is then accessed and modified from a React + TypeScript front end application

## Prerequisites

Before you begin, ensure you have Docker installed on your machine. You can download and install Docker from the official website: [https://www.docker.com/get-started](https://www.docker.com/get-started)

If you already have Docker installed, ensure that it is running prior to building and running the project.

## Building the Docker Image

1. In the root directory of the project, build each container and compose them with the following command:

```bash
docker-compose build
```

2. You can then start the docker containers with the following command:

```bash
docker-compose up
```

Note that the first time the project is run, it will be populating the MongoDB database with the entirety of the patients.json file. This may take up to two minutes and when it is done it will reflect in the terminal logs for 'server'. Running the project again after this will bypass the database loading as it will be already populated.

3. You can access the React application at [React Application](http://localhost:8080/)