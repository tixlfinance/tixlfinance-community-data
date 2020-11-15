#!/bin/sh

# shellcheck disable=SC2045
for entry in `ls ./projects`; do
  npm run push:projects projects/$entry/info.json
done

