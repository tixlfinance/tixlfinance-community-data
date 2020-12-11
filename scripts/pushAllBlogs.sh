#!/bin/sh

# shellcheck disable=SC2045
for entry in `ls ./blogs`; do
  npm run push:blogs blogs/$entry/info.json
done

