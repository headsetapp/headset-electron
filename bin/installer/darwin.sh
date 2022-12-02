#!/usr/bin/env bash

set -e
function failure() {(
  local error_code=$?; local lineno=$1; local cmd=$2
  if [[ ${cmd} == 'create-dmg'* && ${error_code} -eq 2 ]]; then return; fi
  echo "$(basename "$0"): failed at ${lineno}: ${cmd}"
  exit "${error_code}"
)}
trap 'failure "${LINENO}" "${BASH_COMMAND}"' ERR

function check_exit() {
  set +e; local cmd=$1
  eval "${cmd}"; status=$?
  if [[ ${status} -eq 2 && ${GITHUB_REF_NAME:-main} =~ ^v[0-9]+.[0-9]+.[0-9]+$ ]]; then exit 2
  elif [[ ${status} -eq 1 ]]; then exit 1; fi
  set -e
}

_version=${VERSION:?}
_installer_dir="build/installers"

mkdir -p "${_installer_dir}"

# Create x64 installer
echo -e '\n\033[1mPackaging macOS x64 installer: \033[01;0m'
zip -ryq "${_installer_dir}/Headset-${_version}-mac-x64.zip" build/Headset-darwin-x64/Headset.app
check_exit "npx create-dmg --overwrite build/Headset-darwin-x64/Headset.app ${_installer_dir}"
mv "${_installer_dir}/Headset ${_version}.dmg" "${_installer_dir}/Headset-${_version}-x64.dmg"

# Create arm64 installer
echo -e '\n\n\033[1mPackaging macOS arm64 installer: \033[01;0m'
zip -ryq "${_installer_dir}/Headset-${_version}-mac-arm64.zip" build/Headset-darwin-arm64/Headset.app
check_exit "npx create-dmg --overwrite build/Headset-darwin-x64/Headset.app ${_installer_dir}"
mv "${_installer_dir}/Headset ${_version}.dmg" "${_installer_dir}/Headset-${_version}-arm64.dmg"
