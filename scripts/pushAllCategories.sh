#!/bin/sh

# shellcheck disable=SC2045
for entry in `ls ./categories`; do
  npm run push:categories categories/$entry/info.json
done

