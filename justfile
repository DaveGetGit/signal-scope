set shell := ["sh", "-cu"]
set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]

default:
    just --list

dev:
    docker compose --profile dev up app-dev

test:
    docker compose --profile test run --rm app-test

lint:
    docker compose --profile lint run --rm app-lint

check:
    docker compose --profile lint run --rm app-lint
    docker compose --profile test run --rm app-test

build:
    docker compose --profile prod build app-prod

preview:
    docker compose --profile prod up app-prod
