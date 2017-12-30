#!/usr/bin/env bash

echo -e '\n\033[1mPackaging dmg installer: \033[01;0m'
mkdir -p build/installers
zip -ryq "Headset-$NEW_VERSION.zip" build/Headset-darwin-x64/Headset.app
create-dmg build/Headset-darwin-x64/Headset.app

mv "Headset-$NEW_VERSION.dmg" build/installers/.
mv "Headset-$NEW_VERSION.zip" build/installers/.
