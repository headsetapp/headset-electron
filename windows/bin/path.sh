#!/usr/bin/env bash

root="../node_modules"
local="node_modules/.bin"

commandList=(electron
             electron-packager
             http-server
             nf
             mocha)

for command in "${commandList[@]}"
do
  link=$(readlink "$root/.bin/$command")
  ln -sr "${link/../$root}" "$local/$command"
done
