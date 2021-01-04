#!/bin/sh

# shellcheck disable=SC2045
for entry in `ls ./newsprovider`; do
  npm run push:newsprovider newsprovider/$entry/info.json
done

