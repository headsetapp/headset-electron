#!/usr/bin/env bash

set -e

installers="build/installers"

echo -e "\033[1mGPG import procedure:\033[01;0m"
gpg2 --import headset_priv.asc
echo 'digest-algo sha256' > "$HOME"/.gnupg/gpg.conf
echo '%_gpg_name Headset' > "$HOME"/.rpmmacros
echo -e 'Done'
pwd
echo -e "\n\033[1mSigning installer:\033[01;0m"
rpm --addsign "$installers/headset-$VERSION-1.x86_64.rpm"
echo -e 'Done'
