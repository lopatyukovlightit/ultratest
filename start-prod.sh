#!/bin/bash
run() {
    docker-compose -f docker-compose.prod.yml build backend
    docker-compose -f docker-compose.prod.yml up  -d
}

run
