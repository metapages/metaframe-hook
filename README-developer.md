# [Metaframe](https://metapages.org/) template

Fast creation and deployment of advanced [metaframe](https://metapages.org/) websites.

Target audience: developers building [metaframes](https://metapages.org/) or any static website where having the core tools of development, building and publishing are packaged and require a small number of commands.

It has everything you need to get a connectable [metaframe](https://metapages.org/) website up and running and deployed.

## Fork and modify

1) Fork this repo
2) Change in `package.json`:
   - `name` to your npm module name
     - This repo keeps the npm module name in `package.json` close to the github repo name:
       - npm: `@metapages/metaframe-...?`
       - git: `metapages/metaframe-...?`
   - `repository.url`
   - `homepage`
   - `version`: set this to e.g. `0.0.` or whatever you need
3) Meet [host requirements](#host-requirements)
4) Maybe change `APP_FQDN` and `APP_PORT` in `.env` (create if needed) to avoid origin collisions
5) Type `just` and go from there

## Host requirements

  - [just](https://github.com/casey/just#installation)
  - [docker](https://www.docker.com/products/docker-desktop)

That's it. Commands are self-documenting: just type `just`

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
 - You are building to publish at github pages with the url: `https://<user_org>.github.io/<repo-name>/`
   - github pages 👆 comes with limited options for some config:
     - we build browser assets in `./docs` instead of `./dist` (typical default) so that publishing to github pages is less configuration
 - Operating this repository should be "easy" and enjoyable. It's a product of love and passion, I am hoping that you enjoy using at least just a little bit.
