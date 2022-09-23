/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponseConnectorResponse } from 'services/cd-ng'
import type { UseGetReturnData } from '@common/utils/testUtils'

export const AccountConnectorResponse: UseGetReturnData<ResponseConnectorResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'mtran-acct-connector',
        identifier: 'mtranacctconnector',
        description: '',
        orgIdentifier: 'default',
        projectIdentifier: 'defaultproject',
        tags: {},
        type: 'Github',
        spec: {
          url: 'https://github.com/mtran7',
          validationRepo: 'GitExpRepo',
          authentication: {
            type: 'Http',
            spec: {
              type: 'UsernameToken',
              spec: {
                username: 'mtran7',
                usernameRef: null,
                tokenRef: 'mtran74765'
              }
            }
          },
          apiAccess: {
            type: 'Token',
            spec: {
              tokenRef: 'mtran74765'
            }
          },
          delegateSelectors: [],
          executeOnDelegate: false,
          type: 'Account'
        }
      },
      createdAt: 1657215103543,
      lastModifiedAt: 1657215103527,
      status: {
        status: 'SUCCESS',
        testedAt: 1657215108908,
        lastTestedAt: 0,
        lastConnectedAt: 1657215108908
      },
      activityDetails: {
        lastActivityTime: 1657215103955
      },
      harnessManaged: false,
      gitDetails: {},
      entityValidityDetails: {
        valid: true
      }
    },
    correlationId: 'e1841cfc-9ed5-4f7c-a87b-c9be1eeaae34'
  }
}

export const RepositoryURLConnectorResponse: UseGetReturnData<ResponseConnectorResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'mtran',
        identifier: 'mtran',
        description: '',
        orgIdentifier: 'default',
        projectIdentifier: 'defaultproject',
        tags: {},
        type: 'Github',
        spec: {
          url: 'https://github.com/mtran7/GitExpRepo',
          validationRepo: null,
          authentication: {
            type: 'Http',
            spec: {
              type: 'UsernameToken',
              spec: {
                username: 'mtran7',
                usernameRef: null,
                tokenRef: 'mtran74765'
              }
            }
          },
          apiAccess: {
            type: 'Token',
            spec: {
              tokenRef: 'mtran74765'
            }
          },
          delegateSelectors: [],
          executeOnDelegate: false,
          type: 'Repo'
        }
      },
      createdAt: 1657124303065,
      lastModifiedAt: 1657124303048,
      status: {
        status: 'SUCCESS',
        testedAt: 1658272340022,
        lastTestedAt: 0,
        lastConnectedAt: 1658272340022
      },
      activityDetails: {
        lastActivityTime: 1657124303271
      },
      harnessManaged: false,
      gitDetails: {},
      entityValidityDetails: {
        valid: true
      }
    },
    correlationId: 'e1841cfc-9ed5-4f7c-a87b-c9be1eeaae34'
  }
}

export const onEditInitialValuesFixed = {
  type: 'GitClone',
  name: 'gitclonestep1',
  identifier: 'gitclonestep1',
  spec: {
    connectorRef: 'mtranacctconnector',
    repoName: 'abct',
    cloneDirectory: '/harness/reponame',
    depth: 1,
    sslVerify: false,
    runAsUser: '1000',
    resources: {
      limits: {
        memory: '1G',
        cpu: '100m'
      }
    },
    build: {
      type: 'branch',
      spec: {
        branch: 'main'
      }
    }
  },
  description: 'adsfs',
  timeout: '1d'
}
// connectorRef is URL Type Repository
// only branchName and not build type is a runtime input*
export const onEditInitialValuesFixed2 = {
  type: 'GitClone',
  name: 'git-clone-repoconnector',
  identifier: 'gitclonerepoconnector',
  spec: {
    connectorRef: 'mtran',
    cloneDirectory: 's',
    build: {
      type: 'branch',
      spec: {
        branch: '<+input>'
      }
    }
  }
}

export const onEditInitialValuesAllRuntimeInputs = {
  name: 'git-clone-repoconnector',
  identifier: 'gitclonerepoconnector',
  spec: {
    connectorRef: '<+input>',
    repoName: '<+input>',
    cloneDirectory: '<+input>',
    depth: '<+input>',
    sslVerify: '<+input>',
    runAsUser: '<+input>',
    resources: {
      limits: {
        memory: '<+input>',
        cpu: '<+input>'
      }
    },
    build: '<+input>'
  },
  description: '<+input>',
  timeout: '<+input>'
}
