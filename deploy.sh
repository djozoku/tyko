docker build -t ozoku/tyko-base:1.0 .

docker-compose down

docker-compose up -d postgres redis

docker build -t ozoku/tyko-api:1.0 -f apps/api/Dockerfile .

docker-compose up -d api

docker build -t ozoku/tyko-auth:1.0 -f apps/auth/Dockerfile .

docker-compose up -d auth

docker build -t ozoku/tyko-frontend:1.0 -f apps/web/Dockerfile .

docker-compose up -d frontend
