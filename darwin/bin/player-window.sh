#!/usr/bin/env bash

set -e

rm -R ~/Library/Application\ Support/Headset/Cache
http-server ../shared/player -p 3001
