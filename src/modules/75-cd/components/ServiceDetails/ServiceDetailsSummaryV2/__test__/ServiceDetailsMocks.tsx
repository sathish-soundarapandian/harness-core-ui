import type {
  ResponseEnvironmentInstanceDetails,
  ResponseInstanceDetailGroupedByPipelineExecutionList,
  ResponseInstanceGroupedByEnvironmentList
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
