#!/usr/bin/env bash

set -e

mkdir Icon.iconset
sips -z 16 16     Icon.png --out Icon.iconset/icon_16x16.png
sips -z 32 32     Icon.png --out Icon.iconset/icon_16x16@2x.png
sips -z 32 32     Icon.png --out Icon.iconset/icon_32x32.png
sips -z 64 64     Icon.png --out Icon.iconset/icon_32x32@2x.png
sips -z 128 128   Icon.png --out Icon.iconset/icon_128x128.png
sips -z 256 256   Icon.png --out Icon.iconset/icon_128x128@2x.png
sips -z 256 256   Icon.png --out Icon.iconset/icon_256x256.png
sips -z 512 512   Icon.png --out Icon.iconset/icon_256x256@2x.png
sips -z 512 512   Icon.png --out Icon.iconset/icon_512x512.png
cp Icon.png Icon.iconset/icon_512x512@2x.png
iconutil -c icns Icon.iconset
rm -R Icon.iconset

ignoring="(bin|test|Procfile)"

if [[ "$TRAVIS_OS_NAME" == "osx" && "$TRAVIS_PULL_REQUEST" = "false" ]]; then
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
  --executable-name headset \
  --platform=darwin \
  --arch=x64 \
  --asar \
  --ignore=$ignoring \
  --prune true \
  --icon=Icon.icns \
  --out build \
  --overwrite \
  --app-bundle-id="co.headsetapp.app" \
  --app-version="$NEW_VERSION" \
  --build-version="1.0.100" \
  --osx-sign
