## 2.0.0 (2025-12-22)

* ci(package.json): add provenance flag to publishConfig ([4d9133a](https://github.com/refore-ai/copy-to-design-sdk/commit/4d9133a))
* Feat: update authorization with accessToken and appId (#15) ([70ec865](https://github.com/refore-ai/copy-to-design-sdk/commit/70ec865)), closes [#15](https://github.com/refore-ai/copy-to-design-sdk/issues/15)
* chore: add release workflow ([7f16e00](https://github.com/refore-ai/copy-to-design-sdk/commit/7f16e00))


### BREAKING CHANGE

* no more key

* fix: update example with new sdk

* chore: upgrade deps

* fix: normalize region enum values to lowercase

* refactor: rename endpoint to server

* chore: move example/vue to example

* fix: add getAuthorizationPayload comments

* chore(release): add v2 branch with prerelease beta configuration

* chore(release): 2.0.0-beta.1 [skip ci]

* chore(release): update v2 branch release in beta tag

* ci: update permissions to allow write access for contents

## 2.0.0-beta.1 (2025-12-16)

* fix: add getAuthorizationPayload comments ([2fe0043](https://github.com/refore-ai/copy-to-design-sdk/commit/2fe0043))
* fix: normalize region enum values to lowercase ([ec5a10a](https://github.com/refore-ai/copy-to-design-sdk/commit/ec5a10a))
* chore: move example/vue to example ([5bbba2e](https://github.com/refore-ai/copy-to-design-sdk/commit/5bbba2e))
* chore: upgrade deps ([fdbdb7f](https://github.com/refore-ai/copy-to-design-sdk/commit/fdbdb7f))
* refactor: rename endpoint to server ([bb7b1b3](https://github.com/refore-ai/copy-to-design-sdk/commit/bb7b1b3))
* feat: use accessToken and appId instead of key as authorization, need user set region manually ([8b653fe](https://github.com/refore-ai/copy-to-design-sdk/commit/8b653fe))


### BREAKING CHANGE

* no more key

## 1.5.0 (2025-11-07)

* feat: support customize top layer name referrer part ([e4a4b8a](https://github.com/refore-ai/copy-to-design-sdk/commit/e4a4b8a))

## 1.4.0 (2025-11-04)

* feat: allow custom attrs for plugin receive data ([2cce0bf](https://github.com/refore-ai/copy-to-design-sdk/commit/2cce0bf))

## <small>1.3.1 (2025-09-23)</small>

* fix: add package.json main field ([89164db](https://github.com/refore-ai/copy-to-design-sdk/commit/89164db))
* docs: improve README description clarity ([abe692e](https://github.com/refore-ai/copy-to-design-sdk/commit/abe692e))

## 1.3.0 (2025-09-12)

feat: compatible with Safari by user action handling and permission checks ([d5555c0](https://github.com/refore-ai/copy-to-design-sdk/commit/d5555c09625ab27a9c1a8a9d99e77cdc80be2bdd))
feat: add copyPasteDirect method by @kainstar in ([#14](https://github.com/refore-ai/copy-to-design-sdk/pull/14))

## 1.2.0 (2025-09-05)

* fix: use copyPasteInPlugin replace copyToClipboardFromHTML ([44aaf44](https://github.com/refore-ai/copy-to-design-sdk/commit/44aaf44))
* feat: support importMode, optional width and height in options ([524f4e1](https://github.com/refore-ai/copy-to-design-sdk/commit/524f4e1))
* chore(example): html argument arrayable ([2229805](https://github.com/refore-ai/copy-to-design-sdk/commit/2229805))

## 1.1.0 (2025-08-11)

* feat: support copy multi html contents ([6662cf5](https://github.com/refore-ai/copy-to-design-sdk/commit/6662cf5))

## <small>1.0.2 (2025-07-18)</small>

* fix: add data-copy-endpoint attribute on refore-copy-to-design node ([726e5c0](https://github.com/refore-ai/copy-to-design-sdk/commit/726e5c0))
* chore(readme): update usage code ([4a2e891](https://github.com/refore-ai/copy-to-design-sdk/commit/4a2e891))

## <small>1.0.1 (2025-07-17)</small>

* fix(package.json): module and types field value error ([9b85246](https://github.com/refore-ai/copy-to-design-sdk/commit/9b85246))
* chore: use .env save secret information ([d0c04e6](https://github.com/refore-ai/copy-to-design-sdk/commit/d0c04e6))

## 1.0.0 (2025-07-17)

* chore: add vue example ([fe9a816](https://github.com/refore-ai/copy-to-design-sdk/commit/fe9a816))
* chore: adjust release script ([6a97b3c](https://github.com/refore-ai/copy-to-design-sdk/commit/6a97b3c))
* chore: repo init ([c0f0f0c](https://github.com/refore-ai/copy-to-design-sdk/commit/c0f0f0c))
* chore: set commitizen config ([4695ec0](https://github.com/refore-ai/copy-to-design-sdk/commit/4695ec0))
* chore: use vite-tsconfig-paths replace resolve.alias in vue example ([36586dd](https://github.com/refore-ai/copy-to-design-sdk/commit/36586dd))
* fix: add type filed in copy source content ([48bb259](https://github.com/refore-ai/copy-to-design-sdk/commit/48bb259))
* fix: options dev.endpoint -> _endpoint ([9fcfa26](https://github.com/refore-ai/copy-to-design-sdk/commit/9fcfa26))
* feat: implement basic feature ([9a45235](https://github.com/refore-ai/copy-to-design-sdk/commit/9a45235))
