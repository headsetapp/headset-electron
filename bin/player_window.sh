#!/usr/bin/env bash

set -e

if [[ "$OSTYPE" == "linux-gnu" ]]; then
  rm -rf ~/.config/Headset/Cache
fi

if [[ "$OSTYPE" == "darwin" ]]; then
  rm -Rf ~/Library/Application\ Support/Headset/Cache
fi

http-server ./player -p 3001
