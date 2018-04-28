#!/usr/bin/env bash

set -e

ignoring="(/bin|Procfile|/sig)"

if [[ "$TRAVIS_OS_NAME" == "osx" && "$TRAVIS_REPO_SLUG" == "headsetapp/headset-electron" && -n "$TRAVIS_TAG" ]]; then
  KEY_CHAIN=mac-build.keychain
  security create-keychain -p travis $KEY_CHAIN
  # Make the keychain the default so identities are found
  security default-keychain -s $KEY_CHAIN
  # Unlock the keychain
  security unlock-keychain -p travis $KEY_CHAIN
  # Set keychain locking timeout to 3600 seconds
  security set-keychain-settings -t 3600 -u $KEY_CHAIN

  # Add certificates to keychain and allow codesign to access them
  security import "$TRAVIS_BUILD_DIR"/darwin/sig/apple.cer -k $KEY_CHAIN -A /usr/bin/codesign
  security import "$TRAVIS_BUILD_DIR"/darwin/sig/osx.cer -k $KEY_CHAIN -A /usr/bin/codesign
  security import "$TRAVIS_BUILD_DIR"/darwin/sig/osx.p12 -k $KEY_CHAIN -P "$CERT_PASSWORD" -A /usr/bin/codesign

  echo "Add keychain to keychain-list"
  security list-keychains -s $KEY_CHAIN

  echo "Settting key partition list"
  security set-key-partition-list -S apple-tool:,apple: -s -k travis $KEY_CHAIN
fi

electron-packager . \
  --executable-name Headset \
  --platform=darwin \
  --arch=x64 \
  --asar \
  --ignore=$ignoring \
  --prune true \
  --icon=icons/Icon.icns \
  --out build \
  --overwrite \
  --app-bundle-id="co.headsetapp.app" \
  --app-version="$NEW_VERSION" \
  --build-version="1.0.100" \
  --osx-sign
