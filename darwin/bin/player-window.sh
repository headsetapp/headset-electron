#!/usr/bin/env bash

set -e

rm -Rf ~/Library/Application\ Support/Headset/Cache
http-server ../shared/player -p 3001 -c-1
