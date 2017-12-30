#!/usr/bin/env bash

echo "{
  \"url\": \"https://github.com/headsetapp/headset-electron/releases/download/v$TAG_NO_V/Headset-$TAG_NO_V.zip\"
}" > auto_updater.json
