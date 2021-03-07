#!/usr/bin/env bash

_version=${VERSION:?}
nuspec='.chocolatey/headset.nuspec'
install='.chocolatey/tools/chocolateyInstall.ps1'
releaseNotes="https://github.com/headsetapp/headset-electron/releases/tag/v${_version}"

sed -i.bak "s|\(<version>\)\(.*\)\(</version>\)|\1${_version}\3|g" "${nuspec}"
sed -i.bak "s|\(<releaseNotes>\)\(.*\)\(</releaseNotes>\)|\1${releaseNotes}\3|g" "${nuspec}"

sed -i.bak "1s|\('\)\(.*\)\('\)|\1${_version}\3|" "${install}"

rm "${nuspec}.bak"
rm "${install}.bak"
