#!/usr/bin/env bash

set -e

root="../node_modules/.bin"
commandList=(electron
             electron-packager
             eslint
             http-server
             nf
             mocha)

for command in "${commandList[@]}"
do
  link=$(readlink "$root/$command")
  ln -fs "../../../${link/../node_modules}" "$PWD/node_modules/.bin/$command"
done
