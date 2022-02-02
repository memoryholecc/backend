#!/bin/bash

SECRET_ROOT=/run/secrets

ENVS=""

if [ -f "$SECRET_ROOT/DB_PASSWORD" ]; then
    export DATABASE_PASSWORD=$(cat $SECRET_ROOT/DB_PASSWORD)
    echo "[DB_PASSWORD=DATABASE_PASSWORD] Using Secret"

fi

if [ -f "$SECRET_ROOT/DB_USER" ]; then
    export DATABASE_USER=$(cat $SECRET_ROOT/DB_USER)
    echo "[DB_USER=DATABASE_USER] Using Secret"
fi

if [ -f "$SECRET_ROOT/PRISMA_DB_URL" ]; then
    export DATABASE_URL=$(cat $SECRET_ROOT/PRISMA_DB_URL)
    echo "[PRISMA_DB_URL=DATABASE_URL] Using Secret"
fi

if [ -f "$SECRET_ROOT/API_KEY" ]; then
    export API_KEY=$(cat $SECRET_ROOT/API_KEY)
    echo "[API_KEY=API_KEY] Using Secret"
fi

$(ENV) npm run start:prod
