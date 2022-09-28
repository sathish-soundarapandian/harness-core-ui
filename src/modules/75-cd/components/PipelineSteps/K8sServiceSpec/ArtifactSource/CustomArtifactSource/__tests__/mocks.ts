/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const artifacts = {
  sidecars: [
    {
      sidecar: {
        identifier: 'Sidecar',
        type: 'CustomArtifact',
        spec: {
          version: '<+input>'
        }
      }
    }
  ],
  primary: {
    spec: {
      version: '<+input>',
      delegateSelectors: '<+input>',
      inputs: [
        {
          name: 'variable1',
          type: 'String',
          value: '<+input>'
        }
      ],
      scripts: {
        fetchAllArtifacts: {
          artifactsArrayPath: '<+input>',
          attributes: [
            {
              name: 'variable',
              type: 'String',
              value: '<+input>'
            }
          ],
          versionPath: '<+input>',
          spec: {
            shell: 'BASH',
            source: {
              spec: {
                script: '<+input>'
              },
              type: '<+input>',
              timeout: '<+input>'
            }
          }
        }
      }
    },
    type: 'CustomArtifact'
  }
}

export const template = {
  artifacts: {
    sidecars: [
      {
        sidecar: {
          identifier: 'Sidecar',
          type: 'CustomArtifact',
          spec: {
            version: '<+input>'
          }
        }
      }
    ],
    primary: {
      spec: {
        version: '<+input>',
        delegateSelectors: '<+input>',
        inputs: [
          {
            name: 'variable1',
            type: 'String',
            value: '<+input>'
          }
        ],
        scripts: {
          fetchAllArtifacts: {
            artifactsArrayPath: '<+input>',
            attributes: [
              {
                name: 'variable',
                type: 'String',
                value: '<+input>'
              }
            ],
            versionPath: '<+input>',
            spec: {
              shell: 'BASH',
              source: {
                spec: {
                  script: '<+input>'
                },
                type: '<+input>',
                timeout: '<+input>'
              }
            }
          }
        }
      },
      type: 'CustomArtifact'
    }
  }
}
