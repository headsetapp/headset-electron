#!/usr/bin/env bash

set -e

source="build/headset-linux-x64"
ignoring="(bin|test|Procfile|.eslintignore|.eslintrc)"

electron-packager . headset \
  --ignore $ignoring \
  --prune true \
  --out build/ \
  --overwrite \
  --asar \
  --platform=linux \
  --arch=x64

echo -e '\n\033[1mFixing various file permissions: \033[01;0m'
chmod 0644 $source/libnode.so
chmod 0644 $source/resources/app.asar
chmod 0755 $source/resources
chmod 0755 $source/locales
echo -e 'Done'
