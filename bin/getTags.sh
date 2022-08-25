#!/usr/bin/env bash

set -e

mapfile -t REFS < <(git rev-list --tags --max-count=2)

CURRENT_TAG=$(git describe --abbrev=0 --tags "${REFS[0]}")
printf '\x1b[32mCurrent tag: %s\x1b[0m\n' "${CURRENT_TAG#v}"
printf "::set-output name=newtag::%s\n" "${CURRENT_TAG#v}"

if [[ ${#REFS[@]} -eq 2 ]]; then
  PREVIOUS_TAG=$(git describe --abbrev=0 --tags "${REFS[1]}")
  printf '\x1b[32mPrevious tag: %s\x1b[0m\n' "${PREVIOUS_TAG#v}"
  printf "::set-output name=oldtag::%s\n" "${PREVIOUS_TAG#v}"
fi
