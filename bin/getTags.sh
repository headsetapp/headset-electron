#!/usr/bin/env bash

set -e

mapfile -t REFS < <(git rev-list --tags --max-count=2)

NEWTAG=$(git describe --abbrev=0 --tags "${REFS[0]}")
OLDTAG=$(git describe --abbrev=0 --tags "${REFS[1]}")

printf '\x1b[32mLatest tag: %s\x1b[0m\n' "$NEWTAG"
printf '\x1b[32mPrevious tag: %s\x1b[0m\n' "$OLDTAG"

printf "::set-output name=newtag::%s\n" "$NEWTAG"
printf "::set-output name=oldtag::%s\n" "$OLDTAG"
