/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const manifests = [
  {
    manifest: {
      identifier: 'manifestKustomize',
      type: 'Kustomize',
      spec: {
        overlayConfiguration: {
          kustomizeYamlFolderPath: '<+input>'
        },
        store: {
          type: 'Github',
          spec: {
            connectorRef: 'github_final_test',
            gitFetchType: 'Branch',
            folderPath: '<+input>',
            branch: 'branch'
          }
        },
        pluginPath: '<+input>',
        skipResourceVersioning: false
      }
    }
  },
  {
    manifest: {
      identifier: 'manifestIdentifier',
      type: 'K8sManifest',
      spec: {
        valuesPaths: '<+input>',
        manifestScope: '<+input>',
        store: {
          type: 'Harness',
          spec: {
            files: '<+input>'
          }
        }
      }
    }
  }
]

export const template = {
  manifests: [
    {
      manifest: {
        identifier: 'manifestKustomize',
        type: 'Kustomize',
        spec: {
          overlayConfiguration: {
            kustomizeYamlFolderPath: '<+input>'
          },
          store: {
            type: 'Github',
            spec: {
              connectorRef: 'github_final_test',
              gitFetchType: 'Branch',
              folderPath: '<+input>',
              branch: 'branch'
            }
          },
          pluginPath: '<+input>',
          skipResourceVersioning: false
        }
      }
    },
    {
      manifest: {
        identifier: 'ident',
        type: 'K8sManifest',
        spec: {
          valuesPaths: '<+input>',
          manifestScope: '<+input>',
          store: {
            type: 'Harness',
            spec: {
              files: '<+input>'
            }
          }
        }
      }
    }
  ]
}

export const path = 'stages[0].stage.spec.serviceConfig.serviceDefinition.spec'

export const stageIdentifier = 'STG1'
