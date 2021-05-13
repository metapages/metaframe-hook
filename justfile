# https://github.com/casey/just
# Build, test, and develop
set shell := ["bash", "-c"]
ROOT               := `dirname $(dirname $PWD)`
NPM_MODULE         := `cat package.json | jq -r .name`
NPM_TOKEN          := env_var_or_default("NPM_TOKEN", "")
export CI          := env_var_or_default("CI", "")
parcel             := "./node_modules/parcel-bundler/bin/cli.js"
tsc                := "./node_modules/typescript/bin/tsc"
# minimal formatting, bold is very useful
bold               := '\033[1m'
normal             := '\033[0m'

_help:
    @just --list --unsorted --list-heading $'Commands:\n'

# Build the npm distributions in dist
build: clean _build
_build:
    npm run build

# Develop:
#   1. just dev
#   2. modify metapage/metaframe code
#   3. refresh browser window
# TODO
dev:
    # just test/dev

# watch for file changes, then build into ./dist
@watch:
    # No clean operation because that might break symlinks
    echo "👀 watching and building into ./dist..."
    watchexec --watch src -- 'just _build'

# npm link the package in dist for local development. In the other project: 'npm link <this project>'
@link: unlink build
    npm link
    echo -e "👉 in the other project: 'npm link {{NPM_MODULE}}'"

# unlink the package in dist from local development. You probably don't ever need to do this
@unlink:
    npm unlink

# If the version does not exist, publish the npm module
publish: _require_NPM_TOKEN
    #!/usr/bin/env bash
    set -euo pipefail
    if [ "$CI" != "true" ]; then
        # This check is here to prevent publishing if there are uncommitted changes, but this check does not work in CI environments
        # because it starts as a clean checkout and git is not installed and it is not a full checkout, just the tip
        if [[ $(git status --short) != '' ]]; then
            git status
            echo -e '💥 Cannot publish with uncommitted changes'
            exit 2
        fi
    fi
    VERSION=`cat package.json | jq -r '.version'`
    #INDEX=`npm view {{NPM_MODULE}} versions --json | jq "index( \"$VERSION\" )"`
    #if [ "$INDEX" != "null" ]; then
    #    echo -e '🌳 Version exists, not publishing'
    #    exit 0
    #fi
    just build
    echo "PUBLISHING npm version $VERSION"
    echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
    npm publish --access public .

# Unpublish version https://docs.npmjs.com/cli/v7/commands/npm-unpublish
unpublish version:
    @echo "❗ If this fails: you cannot use .npmrc or NPM_TOKEN, you must 'npm login' 🤷‍♀️"
    rm -rf .npmrc
    NPM_TOKEN= npm unpublish {{NPM_MODULE}}@{{version}}

# List all published versions
@list:
    npm view {{NPM_MODULE}} versions --json

# https://docs.npmjs.com/cli/v7/commands/npm-deprecate
module_deprecate version +message:
    npm deprecate {{NPM_MODULE}}@{{version}} "{{message}}"

# delete all generated assets/files
@clean:
    mkdir -p dist
    @rm -rf dist/*
    just test/clean

@_require_NPM_TOKEN:
    if [ -z "$NPM_TOKEN" ]; then echo "Missing NPM_TOKEN"; exit 1; fi
