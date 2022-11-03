/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponsePageConnectorResponse } from 'services/cd-ng'

export const getYaml = (): string => `
pipeline:
  name: wbnrvo
  identifier: wbnrvo
  projectIdentifier: Depanshu_spot
  orgIdentifier: default
  tags: {}
  stages:
    - stage:
        name: ervber
        identifier: ervber
        description: ""
        type: Deployment
        spec:
          deploymentType: Elastigroup
          service:
            serviceRef: elastigroupService
          environment:
            environmentRef: testElasti
            deployToAll: false
            infrastructureDefinitions:
              - identifier: infraElastigroup
                inputs:
                  identifier: infraElastigroup
                  type: Elastigroup
                  spec:
                    connectorRef: <+input>`

export const invalidYaml = (): string => `
pipeline:
  name: wbnrvo
  identifier: wbnrvo
  projectIdentifier: Depanshu_spot
  orgIdentifier: default
  tags: {}
  stages:
    - stage:
        name: ervber
        identifier: ervber
        description: ""
        type: Deployment
        spec:
          deploymentType: Elastigroup
          service:
            serviceRef: elastigroupService
          environment:
            environmentRef: testElasti
            deployToAll: false
            infrastructureDefinitions:
`

export const spotConnector: ResponsePageConnectorResponse = {
  data: {
    content: [
      {
        connector: {
          name: 'spotConnector',
          identifier: 'spotConnector',
          description: '',
          orgIdentifier: 'testDetail',
          projectIdentifier: 'testDetail',
          tags: {},
          type: 'Spot',
          spec: {
            credential: {
              type: 'ManualConfig',
              spec: {
                accountId: 'admin',
                accountIdRef: null,
                apiTokenRef: 'account.accountTest'
              }
            },
            delegateSelectors: [],
            executeOnDelegate: false
          }
        },
        createdAt: 1666258870403,
        lastModifiedAt: 1666258870396,
        status: {
          status: 'SUCCESS'
        },
        harnessManaged: false,
        entityValidityDetails: {
          valid: true,
          invalidYaml: 'testDetail'
        }
      }
    ],
    pageIndex: 0,
    empty: false
  }
}
