/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ServiceSpec } from 'services/cd-ng'

export const commonFormikInitialValues = {
  pipeline: {
    name: 'Pipeline',
    identifier: 'testPipeline',
    projectIdentifier: 'testProject',
    orgIdentifier: 'testOrg',
    tags: {},
    stages: [
      {
        stage: {
          name: 'Stage 1',
          identifier: 'Stage_1',
          description: '',
          type: 'Deployment',
          spec: {
            serviceConfig: {
              serviceRef: 'HELLO',
              serviceDefinition: {
                spec: {
                  variables: [],
                  artifacts: {
                    primary: {
                      spec: {
                        connectorRef: 'artifactBambooConnector',
                        artifactPaths: [],
                        build: '<+input>',
                        planKey: '<+input>'
                      },
                      type: 'Bamboo'
                    }
                  }
                },
                type: 'ServerlessAwsLambda'
              }
            },
            infrastructure: {
              environmentRef: 'Prod',
              infrastructureDefinition: {
                type: 'ServerlessAwsLambda',
                spec: {
                  connectorRef: '<+input>',
                  stage: '<+input>',
                  region: '<+input>'
                }
              },
              allowSimultaneousDeployments: false
            },
            execution: {
              steps: [
                {
                  step: {
                    type: 'ShellScript',
                    name: 'ss',
                    identifier: 'ss',
                    spec: {
                      shell: 'Bash',
                      onDelegate: true,
                      source: {
                        type: 'Inline',
                        spec: {
                          script: 'echo 1'
                        }
                      },
                      environmentVariables: [],
                      outputVariables: [],
                      executionTarget: {}
                    },
                    timeout: '10m'
                  }
                }
              ],
              rollbackSteps: []
            }
          },
          tags: {},
          failureStrategies: [
            {
              onFailure: {
                errors: ['AllErrors'],
                action: {
                  type: 'StageRollback'
                }
              }
            }
          ]
        }
      }
    ]
  }
}

export const templateBambooArtifact: ServiceSpec = {
  artifacts: {
    primary: {
      spec: {
        connectorRef: 'artifactBambooConnector',
        artifactPaths: '<+input>',
        build: '<+input>',
        planKey: '<+input>'
      },
      type: 'Bamboo'
    }
  }
}

export const templateBambooArtifactWithoutJobName: ServiceSpec = {
  artifacts: {
    primary: {
      spec: {
        artifactPaths: '<+input>',
        build: '<+input>'
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
