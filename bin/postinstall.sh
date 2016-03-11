#!/bin/sh
set -ex

if [ "$NODE_ENV" = "production" ]; then
  node ./node_modules/.bin/jspm install
  node ./node_modules/.bin/knex migrate:latest
fi

