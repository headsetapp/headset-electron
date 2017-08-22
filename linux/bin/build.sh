#!/usr/bin/env bash

set -e

electron-packager . headset \
  --ignore bin \
  --prune true  \
  --packageManager yarn  \
  --out build/  \
  --overwrite  \
  --platform=linux  \
  --arch=x64

echo -e "\n\033[1mPackaging deb installer:\033[01;0m"
electron-installer-debian \
  --src build/headset-linux-x64/ \
  --dest build/installers/ \
  --arch amd64 \
  --config bin/config_deb.json

echo -e "\n\033[1mPackaging rpm installer:\033[01;0m"
electron-installer-redhat \
  --src build/headset-linux-x64/ \
  --dest build/installers/ \
  --arch amd64 \
  --config bin/config_rpm.json
