#!/usr/bin/env bash

set -e

echo -e '\n\033[1mPackaging macOS installer: \033[01;0m'
mkdir -p build/installers
zip -ryq "Headset-$VERSION-mac.zip" build/Headset-darwin-x64/Headset.app

set +e
create-dmg --overwrite build/Headset-darwin-x64/Headset.app
if ! [[ $? -eq 0 || $? -eq 2 ]]; then
  exit 1
fi
set -e

mv "Headset $VERSION.dmg" build/installers/"Headset-$VERSION.dmg"
mv "Headset-$VERSION-mac.zip" build/installers/.
