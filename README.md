# Metaframe template

Fast creation and deployment of advanced metaframe websites.

Target audience: developers.

Fork or copy this repo. It has everything you need to get a connectable website up and running and deployed.

## Setup/getting started

1) Install [just](https://github.com/casey/just#installation)
2) Commands: `just`

That's it. Commands are self-documenting.

## Features

- `vite` for fast building
- `preact` for efficient, fast loading sites
- `typescript` for type checking
- `chakra-ui.com` for the UI framework
- `just` for a single method to build/test/deploy/publish
- `docker` because I don't want to touch/rely your host system except where needed

## Assumptions:

 - `just` will be the command runner, not `npm` (directly) or `make` or any other underlying tech specific command runner. `just` is the main entry point to control all aspects of the software lifecycle.
   - Prefer contextual error messages with calls to action over documentation that is not as close as possible to the code or commands. Distance creates indirection and staleness and barriers to keep updated.
 - You are building to publish at github pages with the url: https://<user_org>.github.io/<repo-name>/
   - github pages 👆 comes with limited options for some config:
     - we build browser assets in `./docs` instead of `./dist` (typical default) so that publishing to github pages is less configuration
 - Operating this repository should be "easy" and enjoyable. It's a product of love and passion, I am hoping that you enjoy using at least just a little bit.
