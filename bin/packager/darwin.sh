#!/usr/bin/env bash

# TODO: check if create-keychain password (-p) is still travis

set -e

DIR="$GITHUB_WORKSPACE/headset-electron/sig"

if [[ "$GITHUB_REPOSITORY" == "headsetapp/headset-electron" && "$GITHUB_REF" == refs/tags/* ]]; then
  KEY_CHAIN=mac-build.keychain
  security create-keychain -p travis $KEY_CHAIN
  # Make the keychain the default so identities are found
  security default-keychain -s $KEY_CHAIN
  # Unlock the keychain
  security unlock-keychain -p travis $KEY_CHAIN
  # Set keychain locking timeout to 3600 seconds
  security set-keychain-settings -t 3600 -u $KEY_CHAIN

  # Add certificates to keychain and allow codesign to access them
  security import "$DIR"/apple.cer -k $KEY_CHAIN -A /usr/bin/codesign
  security import "$DIR"/osx.cer -k $KEY_CHAIN -A /usr/bin/codesign
  security import "$DIR"/osx.p12 -k $KEY_CHAIN -P "$CERT_PASSWORD" -A /usr/bin/codesign

  echo "Add keychain to keychain-list"
  security list-keychains -s $KEY_CHAIN

  echo "Settting key partition list"
  security set-key-partition-list -S apple-tool:,apple: -s -k travis $KEY_CHAIN
fi

OS=darwin node bin/packager/packager.js
