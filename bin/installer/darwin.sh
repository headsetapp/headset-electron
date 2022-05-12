#!/usr/bin/env bash

set -e

_version=${VERSION:?}
_identity="Apple Distribution: Daniel Ravina (4BJNEK4V69)"

echo -e '\n\033[1mPackaging macOS installer: \033[01;0m'
mkdir -p build/installers
zip -ryq "Headset-${_version}-mac.zip" build/Headset-darwin-x64/Headset.app

set +e
create-dmg --overwrite --identity="${_identity}" build/Headset-darwin-x64/Headset.app
if ! [[ $? -eq 0 || $? -eq 2 ]]; then
  exit 1
fi
set -e

mv "Headset ${_version}.dmg" build/installers/"Headset-${_version}.dmg"
mv "Headset-${_version}-mac.zip" build/installers/.
