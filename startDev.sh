#!/bin/bash

# trap ctrl-c and call ctrl_c()
trap ctrl_c INT

function ctrl_c() {
    echo ""
    echo "Shutting down postgres."
    npm run stop:postgres
}

set -e

echo "Starting Postgres Docker and waiting for it to become ready."
npm run start:postgres

TESTREADY=1
while [ $TESTREADY -ne 0 ]
do
    echo -n "."
    sleep 1
    docker exec nestrest2postgres pg_isready
    TESTREADY=$?
done

echo ""
echo "Postgres is ready."

npm run start:watch
