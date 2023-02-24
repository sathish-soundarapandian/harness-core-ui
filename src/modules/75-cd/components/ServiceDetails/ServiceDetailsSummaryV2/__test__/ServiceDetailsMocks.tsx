/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type {
  ResponseArtifactInstanceDetails,
  ResponseEnvironmentInstanceDetails,
  ResponseInstanceDetailGroupedByPipelineExecutionList,
  ResponseInstanceGroupedByEnvironmentList,
  ResponseInstanceGroupedOnArtifactList,
  ResponseOpenTaskDetails
} from 'services/cd-ng'

export const envInstanceDetailsMock: ResponseEnvironmentInstanceDetails = {
  status: 'SUCCESS',
  data: {
    environmentInstanceDetails: [
      {
        envId: 'awspr',
        envName: 'aws-pr',
        environmentType: 'PreProduction',
        count: 2,
        artifactDeploymentDetail: {
          artifact: '/test-artifact',
          lastDeployedAt: 1666785805123
        }
      },
      {
        envId: 'azureEnvPR',
        envName: 'azureEnv-PR',
        environmentType: 'Production',
        count: 4,
        artifactDeploymentDetail: {
          artifact: '/test-artifact',
          lastDeployedAt: 1666150641027
        }
      },
      {
        envId: 'DemoenvTest',
        envName: 'demo-env-Test-pdc',
        environmentType: 'PreProduction',
        count: 2,
        artifactDeploymentDetail: {
          artifact: '/test-artifact',
          lastDeployedAt: 1666870992508
        }
      },
      {
        envId: 'winrmnew',
        envName: 'winrm-new',
        environmentType: 'PreProduction',
        count: 2,
        artifactDeploymentDetail: {
          artifact: '/test-artifact',
          lastDeployedAt: 1663761753831
        }
      }
    ]
  },
  metaData: undefined,
  correlationId: '0431d299-e562-4e6e-b9ed-1320c5df5263'
}

export const activeInstanceGroupByEnv: ResponseInstanceGroupedByEnvironmentList = {
  status: 'SUCCESS',
  data: {
    instanceGroupedByEnvironmentList: [
      {
        envId: 'winrmnew',
        envName: 'winrm-new',
        instanceGroupedByEnvironmentTypeList: [
          {
            environmentType: 'PreProduction',
            instanceGroupedByInfrastructureList: [
              {
                infrastructureId: undefined,
                infrastructureName: undefined,
                clusterId: undefined,
                agentId: undefined,
                instanceGroupedByArtifactList: [
                  {
                    artifact: '/test-artifact',
                    count: 2,
                    lastDeployedAt: 1663761753831
                  }
                ],
                lastDeployedAt: 1663761753831
              }
            ],
            lastDeployedAt: 1663761753831
          }
        ],
        lastDeployedAt: 1663761753831
      },
      {
        envId: 'DemoenvTest',
        envName: 'demo-env-Test-pdc',
        instanceGroupedByEnvironmentTypeList: [
          {
            environmentType: 'PreProduction',
            instanceGroupedByInfrastructureList: [
              {
                infrastructureId: 'winpdcdemo',
                infrastructureName: 'win-pdc-demo',
                clusterId: undefined,
                agentId: undefined,
                instanceGroupedByArtifactList: [
                  {
                    artifact: '/test-artifact',
                    count: 2,
                    lastDeployedAt: 1666870992508
                  }
                ],
                lastDeployedAt: 1666870992508
              }
            ],
            lastDeployedAt: 1666870992508
          }
        ],
        lastDeployedAt: 1666870992508
      },
      {
        envId: 'awspr',
        envName: 'aws-pr',
        instanceGroupedByEnvironmentTypeList: [
          {
            environmentType: 'PreProduction',
            instanceGroupedByInfrastructureList: [
              {
                infrastructureId: 'testInfra',
                infrastructureName: 'testInfra',
                clusterId: undefined,
                agentId: undefined,
                instanceGroupedByArtifactList: [
                  {
                    artifact: '/test-artifact',
                    count: 2,
                    lastDeployedAt: 1666785805123
                  }
                ],
                lastDeployedAt: 1666785805123
              }
            ],
            lastDeployedAt: 1666785805123
          }
        ],
        lastDeployedAt: 1666785805123
      },
      {
        envId: 'azureEnvPR',
        envName: 'azureEnv-PR',
        instanceGroupedByEnvironmentTypeList: [
          {
            environmentType: 'Production',
            instanceGroupedByInfrastructureList: [
              {
                infrastructureId: undefined,
                infrastructureName: undefined,
                clusterId: undefined,
                agentId: undefined,
                instanceGroupedByArtifactList: [
                  {
                    artifact: '/test-artifact',
                    count: 1,
                    lastDeployedAt: 1666150641027
                  },
                  {
                    artifact: '',
                    count: 3,
                    lastDeployedAt: 1666150641029
                  }
                ],
                lastDeployedAt: 1666150641027
              }
            ],
            lastDeployedAt: 1666150641027
          }
        ],
        lastDeployedAt: 1666150641027
      }
    ]
  },
  metaData: undefined,
  correlationId: 'a9b42d6a-789d-4f79-b3a5-90f3680eb437'
}

export const activeInstanceDetail: ResponseInstanceDetailGroupedByPipelineExecutionList = {
  status: 'SUCCESS',
  data: {
    instanceDetailGroupedByPipelineExecutionList: [
      {
        pipelineId: 'testPipelineId',
        planExecutionId: 'testPipelineExecId',
        lastDeployedAt: 1663761753831,
        instances: [
          {
            podName: '',
            artifactName: '/test-artifact',
            connectorRef: undefined,
            infrastructureDetails: {
              host: 'testHostName'
            },
            terraformInstance: undefined,
            deployedAt: 1663761753831,
            deployedById: 'testDeployId',
            deployedByName: 'Dummy',
            pipelineExecutionName: 'testPipelineId',
            instanceInfoDTO: {
              serviceType: 'WinRm',
              infrastructureKey: 'testKey',
              host: 'testHostName',
              type: 'Pdc',
              podName: ''
            } as any
          },
          {
            podName: '',
            artifactName: '/test-artifact',
            connectorRef: undefined,
            infrastructureDetails: {
              host: 'testHostName2'
            },
            terraformInstance: undefined,
            deployedAt: 1663761743193,
            deployedById: 'testDeployId',
            deployedByName: 'Dummy',
            pipelineExecutionName: 'testPipelineId',
            instanceInfoDTO: {
              serviceType: 'WinRm',
              infrastructureKey: 'testKey',
              host: 'testHostName2',
              type: 'Pdc',
              podName: ''
            }
          }
        ]
      }
    ]
  },
  metaData: undefined,
  correlationId: '40d0feed-0d29-4157-a1da-da7cbc569fb4'
}

export const artifactInstanceDetailsMock: ResponseArtifactInstanceDetails = {
  status: 'SUCCESS',
  data: {
    artifactInstanceDetails: [
      {
        artifact: 'testArtifactDisplayName',
        environmentInstanceDetails: {
          environmentInstanceDetails: [
            {
              envId: 'sampleEnv',
              envName: 'sampleEnv',
              environmentType: 'PreProduction',
              count: undefined,
              artifactDeploymentDetail: {
                artifact: 'testArtifactDisplayName',
                lastDeployedAt: 1675925501095
              }
            }
          ]
        }
      }
    ]
  },
  metaData: undefined,
  correlationId: 'test'
}

export const artifactTableMock: ResponseInstanceGroupedOnArtifactList = {
  status: 'SUCCESS',
  data: {
    instanceGroupedOnArtifactList: [
      {
        artifact: 'testArtifactName',
        lastDeployedAt: 1675925501095,
        instanceGroupedOnEnvironmentList: [
          {
            envId: 'sampleEnv',
            envName: 'sampleEnv',
            lastDeployedAt: 1675925501095,
            instanceGroupedOnEnvironmentTypeList: [
              {
                environmentType: 'PreProduction',
                lastDeployedAt: 1675925501095,
                instanceGroupedOnInfrastructureList: [
                  {
                    infrastructureId: 'infra',
                    infrastructureName: 'infra',
                    clusterId: undefined,
                    agentId: undefined,
                    lastDeployedAt: 1675925501095,
                    count: 1
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        artifact: 'testArtifactName2',
        lastDeployedAt: 1675925501095,
        instanceGroupedOnEnvironmentList: [
          {
            envId: 'sampleEnv2',
            envName: 'sampleEnv2',
            lastDeployedAt: 1675925501095,
            instanceGroupedOnEnvironmentTypeList: [
              {
                environmentType: 'Production',
                lastDeployedAt: 1675925501095,
                instanceGroupedOnInfrastructureList: [
                  {
                    infrastructureId: undefined,
                    infrastructureName: undefined,
                    clusterId: 'clusterId',
                    agentId: undefined,
                    lastDeployedAt: 1675925501095,
                    count: 1
                  },
                  {
                    infrastructureId: undefined,
                    infrastructureName: undefined,
                    clusterId: undefined,
                    agentId: undefined,
                    lastDeployedAt: 1675925501095,
                    count: 1
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  metaData: undefined,
  correlationId: 'test'
}

export const openTaskMock: ResponseOpenTaskDetails = {
  status: 'SUCCESS',
  data: {
    pipelineDeploymentDetails: [
      {
        pipelineExecutionId: 'testPipeExecId',
        planExecutionId: 'testPlanExecId',
        identifier: 'activeInstance_Clone',
        name: 'activeInstance - Clone',
        status: 'FAILED',
        deployedById: 'testUser',
        deployedByName: undefined,
        lastExecutedAt: 1676713790901
      },
      {
        pipelineExecutionId: 'testPipeExecId2',
        planExecutionId: 'testPlanExecId2',
        identifier: 'activeInstance_Clone',
        name: 'activeInstance - Clone',
        status: 'FAILED',
        deployedById: 'testUser',
        deployedByName: undefined,
        lastExecutedAt: 1676712208865
      }
    ]
  },
  metaData: undefined,
  correlationId: 'd9c0ce00-6485-4603-ab74-a6a3aa6d1006'
}
