#!/usr/bin/env bash

set -e

_version=${VERSION:?}
_app_dir="build/Headset-darwin"
_installer_dir="build/installers"

echo -e '\n\033[1mSignature and notarized check for macOS x64\033[01;0m'
codesign -dvvv "${_app_dir}-x64/Headset.app"
echo
spctl -a -t exec -v "${_app_dir}-x64/Headset.app"
echo
codesign -dvvv "${_installer_dir}/Headset-${_version}-x64.dmg"


echo -e '\n\033[1mSignature and notarized check for macOS arm64\033[01;0m'
codesign -dvvv "${_app_dir}-arm64/Headset.app"
echo
spctl -a -t exec -v "${_app_dir}-arm64/Headset.app"
echo
codesign -dvvv "${_installer_dir}/Headset-${_version}-arm64.dmg"
