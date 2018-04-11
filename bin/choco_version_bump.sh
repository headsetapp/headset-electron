#!/usr/bin/env bash

file='windows/chocolatey/headset.nuspec'

sed -i "s|\(<version>\)\(.*\)\(</version>\)|\1$VERSION\3|g" $file
