#!/usr/bin/env bash

set -e

echo -e '\n\033[1mPackaging dmg installer: \033[01;0m'
mkdir -p build/installers
zip -ryq "Headset-$NEW_VERSION.zip" build/Headset-darwin-x64/Headset.app

set +e; create-dmg --overwrite build/Headset-darwin-x64/Headset.app; set -e

mv "Headset $NEW_VERSION.dmg" build/installers/"Headset-$NEW_VERSION.dmg"
mv "Headset-$NEW_VERSION.zip" build/installers/.
