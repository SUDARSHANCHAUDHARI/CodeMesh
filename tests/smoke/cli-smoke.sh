#!/usr/bin/env sh
set -eu

node dist/cli/index.js --help >/dev/null
node dist/cli/index.js --version >/dev/null
node dist/cli/index.js plugins list >/dev/null
node dist/cli/index.js doctor >/dev/null
