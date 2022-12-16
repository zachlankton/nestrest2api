#!/bin/bash

docker container inspect nestrest2postgres > /dev/null
if [ $? == 0 ]; then exit 1; fi;

docker run --name "nestrest2postgres" \
  -e POSTGRES_USER="nestrest2admin" \
  -e POSTGRES_PASSWORD="mysecretpassword" \
  -e POSTGRES_DB="nestrest2" \
  -p 5432:5432 \
  -d postgres
