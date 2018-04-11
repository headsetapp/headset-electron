#!/usr/bin/env bash

file='.chocolatey/headset.nuspec'

sed -i.bak "s|\(<version>\)\(.*\)\(</version>\)|\1$VERSION\3|g" $file
rm $file.bak
