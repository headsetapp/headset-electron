#!/usr/bin/env bash

set -e

rm -rf ~/.config/Headset/Cache
http-server ../shared/player -p 3001
