#!/bin/sh
set -eu

tsc -p tsconfig.json
tsc -p tsconfig.json --watch --preserveWatchOutput &
watcher=$!
trap 'kill "$watcher"' EXIT INT TERM
exec node --watch dist/index.js
