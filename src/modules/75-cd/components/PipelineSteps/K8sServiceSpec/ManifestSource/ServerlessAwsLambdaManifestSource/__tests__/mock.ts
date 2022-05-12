/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const template = {
  manifests: [
    {
      manifest: {
        identifier: 'test_manifest',
        type: 'ServerlessAwsLambda',
        spec: {
          store: {
            type: 'Github',
            spec: {
              connectorRef: '<+input>',
              paths: '<+input>',
              repoName: '<+input>',
              branch: '<+input>'
            }
          },
          configOverridePath: '<+input>'
        }
      }
    }
  ],
  artifacts: {
    primary: {
      type: 'ArtifactoryRegistry',
      spec: {
        connectorRef: '<+input>',
        artifactDirectory: '<+input>',
        artifactPath: '<+input>',
        repository: '<+input>'
      }
    }
  }
}

export const manifests = [
  {
    manifest: {
      identifier: 'test_manifest',
      type: 'ServerlessAwsLambda',
      spec: {
        store: {
          type: 'Github',
          spec: {
            connectorRef: '<+input>',
            gitFetchType: 'Branch',
            paths: '<+input>',
            repoName: '<+input>',
            branch: '<+input>'
          }
        },
        configOverridePath: '<+input>'
      }
    }
  }
]

export const initialValues = {
  manifests: [
    {
      manifest: {
        identifier: 'test_manifest',
        type: 'ServerlessAwsLambda',
        spec: {
          store: {
            type: 'Github',
            spec: {
              connectorRef: '',
              paths: '',
              repoName: '',
              branch: ''
            }
          },
          configOverridePath: ''
        }
      }
    }
  ],
  artifacts: {
    primary: {
      type: 'ArtifactoryRegistry',
      spec: {
        connectorRef: '',
        artifactDirectory: '',
        artifactPath: '',
        repository: ''
      }
    }
  }
}

export const manifest = {
  identifier: 'test_manifest',
  type: 'ServerlessAwsLambda',
  spec: {
    store: {
      type: 'Github',
      spec: {
        connectorRef: '<+input>',
        gitFetchType: 'Branch',
        paths: '<+input>',
        repoName: '<+input>',
        branch: '<+input>'
      }
    },
    configOverridePath: '<+input>'
  }
}
