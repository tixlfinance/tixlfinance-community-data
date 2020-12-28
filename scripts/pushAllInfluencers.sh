#!/bin/sh

# shellcheck disable=SC2045
for entry in `ls ./influencers`; do
  npm run push:influencers blogs/$entry/info.json
done

