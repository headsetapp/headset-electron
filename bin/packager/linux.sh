#!/usr/bin/env bash

set -e

source="build/Headset-linux-x64"

OS=linux node bin/packager/packager.js

# Add repository signing key
cp gh-pages/headset.gpg "${source}/headset-archive-keyring.gpg"

echo -e '\n\033[1mFixing various file permissions: \033[01;0m'
find "${source}" -type f -exec chmod 0644 {} +
find "${source}" -type d -exec chmod 0755 {} +
chmod 0755 "${source}/headset"
chmod 0755 bin/debian_scripts/postinst
chmod 0755 bin/debian_scripts/postrm
echo -e 'Done'
