## Installation

```bash
$ npm install
```

## Running the app

```bash
# Optional for running the PostgreSQL container
$ docker-compose up db

# Running dev server
$ npm run start:dev

# Build prod
$ npm run build

# Start build
$ start:prod

# Docker
# start containers (dev)
$ docker-compose up -d

# start containers (prod)
$ docker-compose -f docker-compose.prod.yml build backend
$ docker-compose -f docker-compose.prod.yml up  -d
# or
$ sudo ./start-prod.sh

```

