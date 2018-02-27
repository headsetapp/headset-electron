#!/usr/bin/env bash

set -ev

if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
  npm run lint linux
  npm run lint shared
  npm run lint test
fi

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
  npm run lint darwin
fi
