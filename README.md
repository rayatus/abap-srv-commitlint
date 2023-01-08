# abap-srv-commitlint
**PoC** for executing [CommitLint](https://commitlint.js.org) via Node Express server
meant to be used in [abapgit-commitlint](https://github.com/rayatus/abapgit-commitlint)

## Work in progress
As all PoC's this repo is still `WIP` so there are quite few things that needs to be refactored and also maybe not that `secure`, **use it at your own risk**.

## Installation
So far it is meant to be installed in any reachable Server that could be able to run Node Express server applications, such as Cloud Foundry.

## Dependencies
* [@commitlint/config-conventional](https://www.npmjs.com/package/@commitlint/config-conventional)
* [@commitlint/core](https://www.npmjs.com/package/@commitlint/core)
