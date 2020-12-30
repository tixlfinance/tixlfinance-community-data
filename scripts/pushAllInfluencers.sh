#!/bin/sh

# shellcheck disable=SC2045
for entry in `ls ./../influencers`; do
  npm run push:influencers influencers/$entry/info.json
done

