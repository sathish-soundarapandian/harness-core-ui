# Microfrontend Types

This package is used in Next Gen UI and across microfrontends for type definitions.

### How to publish types?

1. Make the required changes.
2. Bump up the version in `src/microfrontends/package.json` according to changes made. Please follow [SemVer](https://semver.org/).
3. Get it merged to develop branch.
4. Package will be autopublished once the changes are merged to develop branch.
   > Note: For development purposes publish packages with `alpha`, `beta` or corresponding tags.  
   > For development purposes use `yalc` and publish a beta version only if necessary. Use pipeline mentioned below to create `alpha`, `beta` versions (Pipeline reads version from `src/microfrontends/package.json`, make sure to update it before running pipeline).

Pipeline for publishing types - [Harness](https://app.harness.io/ng/#/account/vpCkHKsDSxK9_KYfjCTMKA/ci/orgs/default/projects/NextGenUI/pipelines/Microfrontends_Publish_Package/pipeline-studio/?storeType=INLINE)
