#!/usr/bin/env bash

set -e

environments=(darwin linux windows)

local="node_modules/.bin"

commandList=(electron
             electron-packager
             http-server
             nf
             mocha)

for os in "${environments[@]}"
do
  for command in "${commandList[@]}"
  do
    rm -f "$os/$local/$command"
  done
done
