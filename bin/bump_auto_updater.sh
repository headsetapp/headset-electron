#!/usr/bin/env bash

echo "{
  \"url\": \"https://github.com/headsetapp/headset-electron/releases/download/v$VERSION/Headset-$VERSION.zip\"
}" > auto_updater.json
