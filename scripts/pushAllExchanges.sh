#!/bin/sh

# shellcheck disable=SC2045
for entry in `ls ./exchanges`; do
  npm run push:exchanges exchanges/$entry/info.json
done

