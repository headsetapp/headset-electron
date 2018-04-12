#!/usr/bin/env bash

nuspec='.chocolatey/headset.nuspec'
install='.chocolatey/tools/chocolateyInstall.ps1'

sed -i.bak "s|\(<version>\)\(.*\)\(</version>\)|\1$VERSION\3|g" $nuspec
sed -i.bak "1s|\('\)\(.*\)\('\)|\1$VERSION\3|" $install

rm $nuspec.bak
rm $install.bak
