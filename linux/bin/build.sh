#!/usr/bin/env bash

set -e

source="build/headset-linux-x64"
destination="build/installers"
ignoring=(bin test Procfile)

electron-packager . headset \
  --ignore $ignoring \
  --prune true \
  --out build/ \
  --overwrite \
  --asar true \
  --platform=linux \
  --arch=x64

echo -e "\n\033[1mFixing various file permissions: \033[01;0m"
chmod 0644 $source/libnode.so
chmod 0644 $source/resources/app.asar
chmod 0755 $source/resources
chmod 0755 $source/locales
echo -e "Done"

echo -e "\n\033[1mPackaging deb installer: \033[01;0m"
electron-installer-debian \
  --src $source \
  --dest $destination \
  --arch amd64 \
  --config bin/config_deb.json

echo -e "\n\033[1mPackaging rpm installer: \033[01;0m"
electron-installer-redhat \
  --src $source \
  --dest $destination \
  --arch x86_64 \
  --config bin/config_rpm.json
