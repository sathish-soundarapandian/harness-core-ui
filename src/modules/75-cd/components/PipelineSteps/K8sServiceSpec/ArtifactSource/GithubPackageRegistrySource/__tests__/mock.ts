/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ServiceSpec } from 'services/cd-ng'

export const templateGithubPackageRegistry: ServiceSpec = {
  artifacts: {
    primary: {
      spec: {
        connectorRef: '<+input>',
        org: '<+input>',
        packageName: '<+input>',
        version: '<+input>'
      },
      type: 'GithubPackageRegistry'
    }
  }
}

export const templateGithubPackageRegistryWithVersionRegex: ServiceSpec = {
  artifacts: {
    primary: {
      spec: {
        connectorRef: '<+input>',
        org: '<+input>',
        packageName: '<+input>',
        versionRegex: '<+input>'
      },
      type: 'GithubPackageRegistry'
    }
  }
}

export const commonFormikInitialValues = {
  pipeline: {
    name: 'Pipeline 1',
    identifier: 'Pipeline_1',
    projectIdentifier: 'testProject',
    orgIdentifier: 'default',
    tags: {},
    stages: [
      {
        stage: {
          identifier: 'vivek',
          type: 'Deployment',
          spec: {
            serviceConfig: {
              serviceDefinition: {
                type: 'Kubernetes',
                spec: {
                  artifacts: {
                    primary: {
                      type: 'GithubPackageRegistry',
                      spec: {
                        connectorRef: '',
                        org: '',
                        packageName: '',
                        version: ''
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]
  }
}
