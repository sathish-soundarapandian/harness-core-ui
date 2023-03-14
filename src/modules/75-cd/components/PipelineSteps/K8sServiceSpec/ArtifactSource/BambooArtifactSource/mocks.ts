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
        type: 'Bamboo',
        spec: {
          connectorRef: '<+input>',
          planName: '<+input>',
          artifactPaths: '<+input>',
          build: '<+input>'
        }
      }
    }
  ],
  primary: {
    spec: {
      connectorRef: '<+input>',
      planName: '<+input>',
      artifactPaths: '<+input>',
      build: '<+input>'
    },
    type: 'Bamboo'
  }
}

export const template = {
  artifacts: {
    sidecars: [
      {
        sidecar: {
          identifier: 'Sidecar',
          type: 'Bamboo',
          spec: {
            connectorRef: '<+input>',
            planName: '<+input>',
            artifactPaths: '<+input>',
            build: '<+input>'
          }
        }
      }
    ],
    primary: {
      spec: {
        connectorRef: '<+input>',
        planName: '<+input>',
        artifactPaths: '<+input>',
        build: '<+input>'
      },
      type: 'Bamboo'
    }
  }
}

export const artifactsTagRegex = {
  sidecars: [
    {
      sidecar: {
        identifier: 'Sidecar',
        type: 'Bamboo',
        spec: {
          connectorRef: '<+input>',
          planName: '<+input>',
          artifactPaths: '<+input>',
          build: '<+input>'
        }
      }
    }
  ]
}

export const templateTagRegex = {
  artifacts: {
    sidecars: [
      {
        sidecar: {
          identifier: 'Sidecar',
          type: 'Bamboo',
          spec: {
            connectorRef: '<+input>',
            planName: '<+input>',
            artifactPaths: '<+input>',
            build: '<+input>'
          }
        }
      }
    ]
  }
}

export const artifactsWithValues = {
  sidecars: [
    {
      sidecar: {
        identifier: 'Sidecar',
        type: 'Bamboo',
        spec: {
          connectorRef: '<+input>',
          planName: '<+input>',
          artifactPaths: '<+input>',
          build: '<+input>'
        }
      }
    }
  ],
  primary: {
    spec: {
      connectorRef: '<+input>',
      planName: '<+input>',
      artifactPaths: '<+input>',
      build: '<+input>'
    },
    type: 'Bamboo'
  }
}

export const templateWithValues = {
  artifacts: {
    sidecars: [
      {
        sidecar: {
          identifier: 'Sidecar',
          type: 'Bamboo',
          spec: {
            connectorRef: 'connectorRef',

            planName: 'PFP-PT',
            artifactPaths: ['store/helloworld.war'],
            build: '13'
          }
        }
      }
    ],
    primary: {
      spec: {
        connectorRef: 'connectorRef',
        planName: 'PFP-PT',
        artifactPaths: ['store/helloworld.war'],
        build: '13'
      },
      type: 'Bamboo'
    }
  }
}

export const mockPlansResponse = {
  correlationId: 'someid',
  status: 'SUCCESS',
  metaData: null as unknown as undefined,
  data: {
    planKeys: [
      {
        name: 'AW-AW',
        value: 'aws_lambda'
      },
      {
        name: 'TES-HIN',
        value: 'hinger-test'
      },
      {
        name: 'PFP-PT',
        value: 'ppt test'
      },
      {
        name: 'TES-NOD',
        value: 'node-artifact'
      },
      {
        name: 'TES-UJ',
        value: 'ujjwal'
      },
      {
        name: 'TES-AK',
        value: 'akhilesh-cdp'
      },
      {
        name: 'TES-GAR',
        value: 'garvit-test'
      },
      {
        name: 'TEST-TEST',
        value: 'test'
      }
    ]
  }
}

export const mockArtifactPathsResponse = {
  correlationId: 'someid',
  status: 'SUCCESS',
  metaData: null as unknown as undefined,
  data: ['store/helloworld.war']
}

export const mockBuildsResponse = {
  correlationId: 'someid',
  status: 'SUCCESS',
  metaData: null as unknown as undefined,
  data: [
    {
      number: '14',
      revision: 'e34b7e455f97b24c325c93332786b298cf4ab949',
      description: null,
      artifactPath: null,
      buildUrl: 'https://bamboo.dev.harness.io/rest/api/latest/result/PFP-PT-14',
      buildDisplayName: null,
      buildFullDisplayName: null,
      artifactFileSize: null,
      uiDisplayName: 'Build# 14',
      status: null,
      buildParameters: {},
      metadata: {},
      labels: {},
      artifactFileMetadataList: []
    },
    {
      number: '13',
      revision: 'e34b7e455f97b24c325c93332786b298cf4ab949',
      description: null,
      artifactPath: null,
      buildUrl: 'https://bamboo.dev.harness.io/rest/api/latest/result/PFP-PT-13',
      buildDisplayName: null,
      buildFullDisplayName: null,
      artifactFileSize: null,
      uiDisplayName: 'Build# 13',
      status: null,
      buildParameters: {},
      metadata: {},
      labels: {},
      artifactFileMetadataList: []
    },
    {
      number: '12',
      revision: 'e8ec0839f2323f4fdf9837817a83658a8aebc9a8',
      description: null,
      artifactPath: null,
      buildUrl: 'https://bamboo.dev.harness.io/rest/api/latest/result/PFP-PT-12',
      buildDisplayName: null,
      buildFullDisplayName: null,
      artifactFileSize: null,
      uiDisplayName: 'Build# 12',
      status: null,
      buildParameters: {},
      metadata: {},
      labels: {},
      artifactFileMetadataList: []
    },
    {
      number: '11',
      revision: 'e8ec0839f2323f4fdf9837817a83658a8aebc9a8',
      description: null,
      artifactPath: null,
      buildUrl: 'https://bamboo.dev.harness.io/rest/api/latest/result/PFP-PT-11',
      buildDisplayName: null,
      buildFullDisplayName: null,
      artifactFileSize: null,
      uiDisplayName: 'Build# 11',
      status: null,
      buildParameters: {},
      metadata: {},
      labels: {},
      artifactFileMetadataList: []
    },
    {
      number: '10',
      revision: 'dc3c93e9ae31cad504b7cfcecacd0d051479db4d',
      description: null,
      artifactPath: null,
      buildUrl: 'https://bamboo.dev.harness.io/rest/api/latest/result/PFP-PT-10',
      buildDisplayName: null,
      buildFullDisplayName: null,
      artifactFileSize: null,
      uiDisplayName: 'Build# 10',
      status: null,
      buildParameters: {},
      metadata: {},
      labels: {},
      artifactFileMetadataList: []
    },
    {
      number: '5',
      revision: null,
      description: null,
      artifactPath: null,
      buildUrl: 'https://bamboo.dev.harness.io/rest/api/latest/result/PFP-PT-5',
      buildDisplayName: null,
      buildFullDisplayName: null,
      artifactFileSize: null,
      uiDisplayName: 'Build# 5',
      status: null,
      buildParameters: {},
      metadata: {},
      labels: {},
      artifactFileMetadataList: []
    },
    {
      number: '4',
      revision: null,
      description: null,
      artifactPath: null,
      buildUrl: 'https://bamboo.dev.harness.io/rest/api/latest/result/PFP-PT-4',
      buildDisplayName: null,
      buildFullDisplayName: null,
      artifactFileSize: null,
      uiDisplayName: 'Build# 4',
      status: null,
      buildParameters: {},
      metadata: {},
      labels: {},
      artifactFileMetadataList: []
    },
    {
      number: '3',
      revision: null,
      description: null,
      artifactPath: null,
      buildUrl: 'https://bamboo.dev.harness.io/rest/api/latest/result/PFP-PT-3',
      buildDisplayName: null,
      buildFullDisplayName: null,
      artifactFileSize: null,
      uiDisplayName: 'Build# 3',
      status: null,
      buildParameters: {},
      metadata: {},
      labels: {},
      artifactFileMetadataList: []
    }
  ]
}

export const path = 'stages[0].stage.spec.serviceConfig.serviceDefinition.spec'

export const mockConnector = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'Bamboo conn test',
      identifier: 'bamboo_conn_test',
      description: 'Bamboo connector test',
      orgIdentifier: undefined,
      projectIdentifier: undefined,
      tags: {},
      type: 'Bamboo',
      spec: {
        delegateSelectors: ['dummyDelegateSelector'],
        credential: {
          type: 'UsernamePassword',
          spec: {
            username: 'test',
            usernameRef: 'test',
            passwordRef: 'testpwd'
          }
        }
      }
    },
    status: null,
    harnessManaged: false
  }
}
