#!/usr/bin/env bash

set -e

environments=(darwin linux windows)
commandList=(electron
             electron-packager
             eslint
             http-server
             nf
             mocha)

for os in "${environments[@]}"
do
  mkdir -p "$os/node_modules/.bin/"
  for command in "${commandList[@]}"
  do
    link=$(readlink "node_modules/.bin/$command")
    ln -frs "${link/../node_modules}" "$os/node_modules/.bin/$command"
  done
done
