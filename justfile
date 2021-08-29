###############################################################
# Minimal commands to develop, build, test, and deploy
###############################################################
# just docs: https://github.com/casey/just
set shell                          := ["bash", "-c"]
# E.g. 'my.app.com'. Some services e.g. auth need know the external endpoint for example OAuth
# The root domain for this app, serving index.html
export APP_FQDN                    := env_var_or_default("APP_FQDN", "metaframe1.dev")
export APP_PORT                    := env_var_or_default("APP_PORT", "443")
ROOT                               := env_var_or_default("GITHUB_WORKSPACE", `git rev-parse --show-toplevel`)
export CI                          := env_var_or_default("CI", "")
PACKAGE_NAME_SHORT                 := file_name(`cat package.json | jq -r '.name' | sd '.*/' ''`)
# Store the CI/dev docker image in github
export DOCKER_IMAGE_PREFIX         := "ghcr.io/metapages/" + PACKAGE_NAME_SHORT
# Always assume our current cloud ops image is versioned to the exact same app images we deploy
export DOCKER_TAG                  := `if [ "${GITHUB_ACTIONS}" = "true" ]; then echo "${GITHUB_SHA}"; else echo "$(git rev-parse --short=8 HEAD)"; fi`
# Some commands use deno because it's great at this stuff
CLOUDSEED_DENO                     := "https://deno.land/x/cloudseed@v0.0.18"
# cache deno modules on the host so they can be transferred to the docker container
export DENO_DIR                    := ROOT + "/.tmp/deno"
vite                               := "VITE_APP_FQDN=" + APP_FQDN + " VITE_APP_PORT=" + APP_PORT + " NODE_OPTIONS='--max_old_space_size=16384' ./node_modules/vite/bin/vite.js"
tsc                                := "./node_modules/typescript/bin/tsc"
# minimal formatting, bold is very useful
# minimal formatting, bold is very useful
bold                               := '\033[1m'
normal                             := '\033[0m'
green                              := "\\e[32m"
yellow                             := "\\e[33m"
blue                               := "\\e[34m"
magenta                            := "\\e[35m"
grey                               := "\\e[90m"

# If not in docker, get inside
_help:
    #!/usr/bin/env bash
    # exit when any command fails
    set -euo pipefail
    if [ -f /.dockerenv ]; then
        echo ""
        just --list --unsorted --list-heading $'🌱 Commands:\n\n'
        echo ""
    else
        just _docker;
    fi

# Run the dev server. Opens the web app in browser.
@dev:
    if [ -f /.dockerenv ]; then \
        just _dev_container; \
    else \
        just _mkcert; \
        open https://${APP_FQDN}:${APP_PORT}; \
        just _docker just _dev_container; \
    fi

_dev_container: _ensure_npm_modules (_tsc "--build")
    #!/usr/bin/env bash
    APP_ORIGIN=https://${APP_FQDN}:${APP_PORT}
    echo "Browser development pointing to: ${APP_ORIGIN}"
    VITE_APP_ORIGIN=${APP_ORIGIN} {{vite}}

# Build production brower assets into ./docs
@build PUBLISH_SUB_DIR="": _ensure_npm_modules (_tsc "--build")
    mkdir -p docs/{{PUBLISH_SUB_DIR}}
    find docs/{{PUBLISH_SUB_DIR}} -maxdepth 1 -type f -exec rm "{}" \;
    rm -rf docs/{{PUBLISH_SUB_DIR}}/assets
    @PUBLISH_SUB_DIR={{PUBLISH_SUB_DIR}} {{vite}} build --mode=production

# Test. Currently testing is only building.
@test: build

# Publish site to github-pages (includes all prev versions) https://pages.github.com/
publish: _ensureGitPorcelain
    #!/usr/bin/env bash
    set -euo pipefail
    # Mostly CURRENT_BRANCH should be main, but maybe you are testing on a different branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ -z "$(git branch --list gh-pages)" ]; then
        git checkout -b gh-pages;
    fi
    git checkout gh-pages
    # Prefer changes in CURRENT_BRANCH, not our incoming gh-pages rebase
    git rebase -Xours ${CURRENT_BRANCH}
    just build ./v$(cat package.json | jq -r .version)
    # Copy the new build to the root
    find docs/ -maxdepth 1 -type f -exec rm "{}" \;
    rm -rf docs/assets
    cp -r docs/v$(cat package.json | jq -r .version)/* docs/
    # Now commit and push
    git add --all --force docs
    git commit -m "site v$(cat package.json | jq -r .version)"
    git push -uf origin gh-pages
    git checkout ${CURRENT_BRANCH}
    echo -e "👉 Github configuration (once): 🔗 https://github.com/$(git remote get-url origin | sd 'git@github.com:' '' | sd '.git' '')/settings/pages"
    echo -e "  - {{green}}Source{{normal}}"
    echo -e "    - {{green}}Branch{{normal}}: gh-pages 📁 /docs"

# Rebuild the client on changes, but do not serve
watch:
    watchexec -w src -w tsconfig.json -w package.json -w vite.config.ts -- just build

# Deletes: .certs dist
clean:
    rm -rf .certs dist

# compile typescript src, may or may not emit artifacts
_tsc +args="":
    {{tsc}} {{args}}

# DEV: generate TLS certs for HTTPS over localhost https://blog.filippo.io/mkcert-valid-https-certificates-for-localhost/
_mkcert:
    #!/usr/bin/env bash
    if [ -n "$CI" ]; then
        echo "CI=$CI ∴ skipping mkcert"
        exit 0
    fi
    if [ -f /.dockerenv ]; then \
        echo "Inside docker context, assuming mkcert has been run on the host"
        exit 0;
    fi
    if ! command -v mkcert &> /dev/null; then echo "💥 {{bold}}mkcert{{normal}}💥 is not installed (manual.md#host-requirements): https://github.com/FiloSottile/mkcert"; exit 1; fi
    if [ ! -f .certs/{{APP_FQDN}}-key.pem ]; then
        mkdir -p .certs/ ;
        cd .certs/ && mkcert -cert-file {{APP_FQDN}}.pem -key-file {{APP_FQDN}}-key.pem {{APP_FQDN}} localhost ;
    fi
    if ! cat /etc/hosts | grep "{{APP_FQDN}}" &> /dev/null; then
        echo -e "";
        echo -e "💥 Add below to /etc/hosts with this command: {{bold}}sudo vi /etc/hosts{{normal}} 💥";
        echo -e "";
        echo -e "{{bold}}127.0.0.1       {{APP_FQDN}}{{normal}}";
        echo -e "";
        exit 1;
    fi
    echo -e "✅ Local mkcert certificates and /etc/hosts contains: 127.0.0.1       {{APP_FQDN}}"

@_ensure_npm_modules:
    if [ ! -f "{{tsc}}" ]; then npm i; fi

# vite builder commands
@_vite +args="":
    {{vite}} {{args}}

####################################################################################
# Ensure docker image for local and CI operations
# Hoist into a docker container with all require CLI tools installed
####################################################################################
# Hoist into a docker container with all require CLI tools installed
@_docker +args="bash": _build_docker
    echo -e "🌱 Entering docker context: {{bold}}{{DOCKER_IMAGE_PREFIX}}:{{DOCKER_TAG}} from <cloud/>Dockerfile 🚪🚪{{normal}}"
    mkdir -p {{ROOT}}/.tmp
    mkdir -p {{ROOT}}/.node_modules
    touch {{ROOT}}/.tmp/.bash_history
    export WORKSPACE=/repo && \
        docker run \
            --rm \
            -ti \
            -e DOCKER_IMAGE_PREFIX=${DOCKER_IMAGE_PREFIX} \
            -e PS1="< \w/> " \
            -e PROMPT="<%/% > " \
            -e DOCKER_IMAGE_PREFIX={{DOCKER_IMAGE_PREFIX}} \
            -e HISTFILE=$WORKSPACE/.tmp/.bash_history \
            -e WORKSPACE=$WORKSPACE \
            $(if [ -f .env ]; then echo "-v {{ROOT}}/.env:$WORKSPACE/.env"; else echo ""; fi) \
            -v {{ROOT}}/.certs:$WORKSPACE/.certs \
            -v {{ROOT}}/.git:$WORKSPACE/.git \
            -v {{ROOT}}/.gitignore:$WORKSPACE/.gitignore \
            $(if [ -f .npmrc ]; then echo "-v {{ROOT}}/.npmrc:$WORKSPACE/.npmrc"; else echo ""; fi) \
            -v {{ROOT}}/dist:$WORKSPACE/dist \
            -v {{ROOT}}/docs:$WORKSPACE/docs \
            -v {{ROOT}}/index.html:$WORKSPACE/index.html \
            -v {{ROOT}}/justfile:$WORKSPACE/justfile \
            -v {{ROOT}}/package-lock.json:$WORKSPACE/package-lock.json \
            -v {{ROOT}}/package.json:$WORKSPACE/package.json \
            -v {{ROOT}}/public:$WORKSPACE/public \
            -v {{ROOT}}/README.md:$WORKSPACE/README.md \
            -v {{ROOT}}/src:$WORKSPACE/src \
            -v {{ROOT}}/test:$WORKSPACE/test \
            -v {{ROOT}}/tsconfig.json:$WORKSPACE/tsconfig.json \
            -v {{ROOT}}/vite.config.ts:$WORKSPACE/vite.config.ts \
            -v $HOME/.gitconfig:/root/.gitconfig \
            -v $HOME/.ssh:/root/.ssh \
            -p {{APP_PORT}}:{{APP_PORT}} \
            --add-host {{APP_FQDN}}:127.0.0.1 \
            -w $WORKSPACE \
            {{DOCKER_IMAGE_PREFIX}}:{{DOCKER_TAG}} {{args}} || true

# If the ./app docker image in not build, then build it
@_build_docker:
    if [[ "$(docker images -q {{DOCKER_IMAGE_PREFIX}}:{{DOCKER_TAG}} 2> /dev/null)" == "" ]]; then \
        echo -e "🌱🌱  ➡ {{bold}}Building docker image ...{{normal}} 🚪🚪 "; \
        echo -e "🌱 </> {{bold}}docker build -t {{DOCKER_IMAGE_PREFIX}}:{{DOCKER_TAG}} . {{normal}}🚪 "; \
        docker build -t {{DOCKER_IMAGE_PREFIX}}:{{DOCKER_TAG}} . ; \
    fi

_ensure_inside_docker:
    #!/usr/bin/env bash
    set -euo pipefail
    if [ ! -f /.dockerenv ]; then
        echo -e "🌵🔥🌵🔥🌵🔥🌵 Not inside a docker container. First run the command: 'just' 🌵🔥🌵🔥🌵🔥🌵"
        exit 1
    fi

@_ensureGitPorcelain: _ensure_inside_docker
    printf "import { ensureGitNoUncommitted } from '{{CLOUDSEED_DENO}}/git/mod.ts';\
    await ensureGitNoUncommitted();" | deno run --unstable --allow-run --allow-read -
