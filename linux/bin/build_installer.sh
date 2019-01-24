#!/usr/bin/env bash

set -e

source="build/Headset-linux-x64"
destination="build/installers"

echo -e '\n\033[1mPackaging deb installer: \033[01;0m'
electron-installer-debian \
  --src $source \
  --dest $destination \
  --arch amd64 \
  --config bin/configurations/config_deb.json

echo -e '\n\033[1mPackaging rpm installer: \033[01;0m'
electron-installer-redhat \
  --src $source \
  --dest $destination \
  --arch x86_64 \
  --config bin/configurations/config_rpm.json
