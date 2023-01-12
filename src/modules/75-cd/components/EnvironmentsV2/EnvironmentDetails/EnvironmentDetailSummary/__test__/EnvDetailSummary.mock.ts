/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { NativeHelmInstanceInfoDTO, ResponseInstanceGroupedByServiceList } from 'services/cd-ng'

export const emptyActiveInstanceCall = {
  status: 'SUCCESS',
  data: {
    environment: {
      accountId: 'px7xd_BFRCi-pfWPYXVjvw',
      orgIdentifier: 'default',
      projectIdentifier: 'ServiceDashboard',
      identifier: 'Env_Test',
      name: 'Env_Test',
      description: '',
      color: '#0063F7',
      type: 'PreProduction',
      deleted: false,
      tags: {},
      yaml: 'environment:\n  orgIdentifier: "default"\n  projectIdentifier: "ServiceDashboard"\n  identifier: "Env_Test"\n  tags: {}\n  name: "Env_Test"\n  description: ""\n  type: "PreProduction"\n'
    },
    createdAt: 1663229677982,
    lastModifiedAt: 1663235157848
  },
  metaData: null,
  correlationId: 'fb6ac9dd-e351-4b80-911a-1fbc20bb986c'
}

export const summaryAPI = {
  status: 'SUCCESS',
  data: {
    content: [
      {
        pipelineIdentifier: 'stg13',
        orgIdentifier: 'default',
        projectIdentifier: 'ServiceDashboard',
        planExecutionId: 'vIe0Ty1ITZyECOAgxnLfXA',
        name: 'stg13',
        status: 'Success',
        tags: [],
        executionTriggerInfo: {
          triggerType: 'MANUAL',
          triggeredBy: {
            uuid: 'MjArarjBTP27Rxaxwc6HYA',
            identifier: 'testIdTrigger',
            extraInfo: {
              email: 'test.id@harness.io'
            }
          },
          isRerun: false
        },
        governanceMetadata: {
          id: '0',
          deny: false,
          details: [],
          message: '',
          timestamp: '1663235127448',
          status: 'pass',
          accountId: 'px7xd_BFRCi-pfWPYXVjvw',
          orgId: 'default',
          projectId: 'ServiceDashboard',
          entity:
            'accountIdentifier%3Apx7xd_BFRCi-pfWPYXVjvw%2ForgIdentifier%3Adefault%2FprojectIdentifier%3AServiceDashboard%2FpipelineIdentifier%3Astg13',
          type: 'pipeline',
          action: 'onrun',
          created: '1663235127433'
        },
        moduleInfo: {
          cd: {
            __recast: 'io.harness.cdng.pipeline.executions.beans.CDPipelineModuleInfo',
            envGroupIdentifiers: [],
            envIdentifiers: ['Env_Test'],
            environmentTypes: ['PreProduction'],
            infrastructureIdentifiers: [null],
            infrastructureNames: [null],
            infrastructureTypes: ['KubernetesDirect'],
            serviceDefinitionTypes: ['Kubernetes'],
            serviceIdentifiers: ['svc2']
          }
        },
        layoutNodeMap: {
          T1YNliaDQZyO9Zdx9MNVSA: {
            nodeType: 'Deployment',
            nodeGroup: 'STAGE',
            nodeIdentifier: 'stg1',
            name: 'stg1',
            nodeUuid: 'T1YNliaDQZyO9Zdx9MNVSA',
            status: 'Success',
            module: 'cd',
            moduleInfo: {
              cd: {
                __recast: 'io.harness.cdng.pipeline.executions.beans.CDStageModuleInfo',
                serviceInfo: {
                  __recast: 'io.harness.cdng.pipeline.executions.beans.ServiceExecutionSummary',
                  identifier: 'approval',
                  displayName: 'approval',
                  deploymentType: 'Kubernetes',
                  gitOpsEnabled: false,
                  artifacts: {
                    __recast: 'io.harness.cdng.pipeline.executions.beans.ServiceExecutionSummary$ArtifactsSummary',
                    primary: {
                      __recast: 'io.harness.ngpipeline.pipeline.executions.beans.DockerArtifactSummary',
                      imagePath: 'library/nginx',
                      tag: 'stable'
                    },
                    sidecars: []
                  }
                },
                infraExecutionSummary: {
                  __recast: 'io.harness.cdng.pipeline.executions.beans.InfraExecutionSummary',
                  identifier: 'Env_Test',
                  name: 'Env_Test',
                  type: 'PreProduction'
                }
              }
            },
            startTs: 1663235142144,
            endTs: 1663235285897,
            edgeLayoutList: {
              currentNodeChildren: [],
              nextIds: []
            },
            nodeRunInfo: {
              whenCondition: '<+OnPipelineSuccess>',
              evaluatedCondition: true,
              expressions: [
                {
                  expression: 'OnPipelineSuccess',
                  expressionValue: 'true',
                  count: 1
                }
              ]
            },
            failureInfo: {
              message: ''
            },
            failureInfoDTO: {
              message: '',
              failureTypeList: [],
              responseMessages: []
            },
            nodeExecutionId: 'Mp5t0DYrTpuHlhcxDIt71Q',
            executionInputConfigured: false
          }
        },
        modules: ['cd'],
        startingNodeId: 'T1YNliaDQZyO9Zdx9MNVSA',
        startTs: 1663235127448,
        endTs: 1663235297370,
        createdAt: 1663235127507,
        canRetry: true,
        showRetryHistory: false,
        runSequence: 4,
        successfulStagesCount: 1,
        runningStagesCount: 0,
        failedStagesCount: 0,
        totalStagesCount: 1,
        storeType: 'INLINE',
        executionInputConfigured: false,
        allowStageExecutions: false,
        stagesExecution: false
      },
      {
        pipelineIdentifier: 'stg13',
        orgIdentifier: 'default',
        projectIdentifier: 'ServiceDashboard',
        planExecutionId: '-nwZ2c9vRsKJsp4l1-z0rA',
        name: 'stg13',
        status: 'Failed',
        tags: [],
        executionTriggerInfo: {
          triggerType: 'MANUAL',
          triggeredBy: {
            uuid: 'MjArarjBTP27Rxaxwc6HYA',
            identifier: 'testIdTrigger',
            extraInfo: {
              email: 'test.id@harness.io'
            }
          },
          isRerun: false
        },
        executionErrorInfo: {
          message: 'Delegates are not available'
        },
        governanceMetadata: {
          id: '0',
          deny: false,
          details: [],
          message: '',
          timestamp: '1663234902113',
          status: 'pass',
          accountId: 'px7xd_BFRCi-pfWPYXVjvw',
          orgId: 'default',
          projectId: 'ServiceDashboard',
          entity:
            'accountIdentifier%3Apx7xd_BFRCi-pfWPYXVjvw%2ForgIdentifier%3Adefault%2FprojectIdentifier%3AServiceDashboard%2FpipelineIdentifier%3Astg13',
          type: 'pipeline',
          action: 'onrun',
          created: '1663234902102'
        },
        moduleInfo: {
          cd: {
            __recast: 'io.harness.cdng.pipeline.executions.beans.CDPipelineModuleInfo',
            envGroupIdentifiers: [],
            envIdentifiers: ['Env_Test'],
            environmentTypes: ['PreProduction'],
            infrastructureIdentifiers: [null],
            infrastructureNames: [null],
            infrastructureTypes: ['KubernetesDirect'],
            serviceDefinitionTypes: ['Kubernetes'],
            serviceIdentifiers: ['approval']
          }
        },
        layoutNodeMap: {
          zHZAkfY8SHmfv8OFBJaMHg: {
            nodeType: 'Deployment',
            nodeGroup: 'STAGE',
            nodeIdentifier: 'stg1',
            name: 'stg1',
            nodeUuid: 'zHZAkfY8SHmfv8OFBJaMHg',
            status: 'Failed',
            module: 'cd',
            moduleInfo: {
              cd: {
                __recast: 'io.harness.cdng.pipeline.executions.beans.CDStageModuleInfo',
                serviceInfo: {
                  __recast: 'io.harness.cdng.pipeline.executions.beans.ServiceExecutionSummary',
                  identifier: 'approval',
                  displayName: 'approval',
                  deploymentType: 'Kubernetes',
                  gitOpsEnabled: false,
                  artifacts: {
                    __recast: 'io.harness.cdng.pipeline.executions.beans.ServiceExecutionSummary$ArtifactsSummary',
                    primary: {
                      __recast: 'io.harness.ngpipeline.pipeline.executions.beans.DockerArtifactSummary',
                      imagePath: 'library/nginx',
                      tag: 'stable'
                    },
                    sidecars: []
                  }
                },
                infraExecutionSummary: {
                  __recast: 'io.harness.cdng.pipeline.executions.beans.InfraExecutionSummary',
                  identifier: 'Env_Test',
                  name: 'Env_Test',
                  type: 'PreProduction'
                }
              }
            },
            startTs: 1663234902476,
            endTs: 1663234935837,
            edgeLayoutList: {
              currentNodeChildren: [],
              nextIds: []
            },
            nodeRunInfo: {
              whenCondition: '<+OnPipelineSuccess>',
              evaluatedCondition: true,
              expressions: [
                {
                  expression: 'OnPipelineSuccess',
                  expressionValue: 'true',
                  count: 1
                }
              ]
            },
            failureInfo: {
              message: 'Delegates are not available'
            },
            failureInfoDTO: {
              message: 'Delegates are not available',
              failureTypeList: ['APPLICATION_ERROR'],
              responseMessages: [
                {
                  code: 'GENERAL_ERROR',
                  level: 'ERROR',
                  message: 'Delegates are not available',
                  exception: null,
                  failureTypes: ['APPLICATION_ERROR']
                }
              ]
            },
            nodeExecutionId: 'Bi7lpZ_TRT2ho4IlyIWQpQ',
            executionInputConfigured: false
          }
        },
        modules: ['cd'],
        startingNodeId: 'zHZAkfY8SHmfv8OFBJaMHg',
        startTs: 1663234902113,
        endTs: 1663234936012,
        createdAt: 1663234902164,
        canRetry: true,
        showRetryHistory: false,
        runSequence: 1,
        successfulStagesCount: 0,
        runningStagesCount: 0,
        failedStagesCount: 1,
        totalStagesCount: 1,
        storeType: 'INLINE',
        executionInputConfigured: false,
        allowStageExecutions: false,
        stagesExecution: false
      },
      {
        pipelineIdentifier: 'testapproval',
        orgIdentifier: 'default',
        projectIdentifier: 'ServiceDashboard',
        planExecutionId: 'e_SCWyA_SfKv7QoWU1MKjQ',
        name: 'test-approval',
        status: 'Success',
        tags: [],
        executionTriggerInfo: {
          triggerType: 'MANUAL',
          triggeredBy: {
            uuid: 'MjArarjBTP27Rxaxwc6HYA',
            identifier: 'testIdTrigger',
            extraInfo: {
              email: 'test.id@harness.io'
            }
          },
          isRerun: false
        },
        governanceMetadata: {
          id: '0',
          deny: false,
          details: [],
          message: '',
          timestamp: '1663229843957',
          status: 'pass',
          accountId: 'px7xd_BFRCi-pfWPYXVjvw',
          orgId: 'default',
          projectId: 'ServiceDashboard',
          entity:
            'accountIdentifier%3Apx7xd_BFRCi-pfWPYXVjvw%2ForgIdentifier%3Adefault%2FprojectIdentifier%3AServiceDashboard%2FpipelineIdentifier%3Atestapproval',
          type: 'pipeline',
          action: 'onrun',
          created: '1663229843944'
        },
        moduleInfo: {
          cd: {
            __recast: 'io.harness.cdng.pipeline.executions.beans.CDPipelineModuleInfo',
            envGroupIdentifiers: [],
            envIdentifiers: ['Env_Test'],
            environmentTypes: ['PreProduction'],
            infrastructureIdentifiers: ['k8sinfraapproval'],
            infrastructureNames: ['k8s-infra-approval'],
            infrastructureTypes: ['KubernetesDirect'],
            serviceDefinitionTypes: ['Kubernetes'],
            serviceIdentifiers: ['approval']
          }
        },
        layoutNodeMap: {
          'e5aQ23UCRA-AJHGq2BFEiA': {
            nodeType: 'Deployment',
            nodeGroup: 'STAGE',
            nodeIdentifier: 'stg1',
            name: 'stg1',
            nodeUuid: 'e5aQ23UCRA-AJHGq2BFEiA',
            status: 'Success',
            module: 'cd',
            moduleInfo: {
              cd: {
                __recast: 'io.harness.cdng.pipeline.executions.beans.CDStageModuleInfo',
                serviceInfo: {
                  __recast: 'io.harness.cdng.pipeline.executions.beans.ServiceExecutionSummary',
                  identifier: 'approval',
                  displayName: 'approval',
                  deploymentType: 'Kubernetes',
                  gitOpsEnabled: false,
                  artifacts: {
                    __recast: 'io.harness.cdng.pipeline.executions.beans.ServiceExecutionSummary$ArtifactsSummary',
                    sidecars: []
                  }
                },
                infraExecutionSummary: {
                  __recast: 'io.harness.cdng.pipeline.executions.beans.InfraExecutionSummary',
                  identifier: 'Env_Test',
                  name: 'Env_Test',
                  type: 'PreProduction',
                  infrastructureIdentifier: 'k8sinfraapproval',
                  infrastructureName: 'k8s-infra-approval'
                }
              }
            },
            startTs: 1663229844638,
            endTs: 1663229879559,
            edgeLayoutList: {
              currentNodeChildren: [],
              nextIds: []
            },
            nodeRunInfo: {
              whenCondition: '<+OnPipelineSuccess>',
              evaluatedCondition: true,
              expressions: [
                {
                  expression: 'OnPipelineSuccess',
                  expressionValue: 'true',
                  count: 1
                }
              ]
            },
            failureInfo: {
              message: ''
            },
            failureInfoDTO: {
              message: '',
              failureTypeList: [],
              responseMessages: []
            },
            nodeExecutionId: 'dux-aW50Qb-ZnFATTsoz_w',
            executionInputConfigured: false
          }
        },
        modules: ['cd'],
        startingNodeId: 'e5aQ23UCRA-AJHGq2BFEiA',
        startTs: 1663229843957,
        endTs: 1663229879756,
        createdAt: 1663229844038,
        canRetry: true,
        showRetryHistory: false,
        runSequence: 3,
        successfulStagesCount: 1,
        runningStagesCount: 0,
        failedStagesCount: 0,
        totalStagesCount: 1,
        storeType: 'INLINE',
        executionInputConfigured: false,
        allowStageExecutions: false,
        stagesExecution: false
      }
    ],
    pageable: {
      sort: {
        sorted: true,
        unsorted: false,
        empty: false
      },
      pageSize: 20,
      pageNumber: 0,
      offset: 0,
      paged: true,
      unpaged: false
    },
    last: true,
    totalPages: 1,
    totalElements: 3,
    first: true,
    sort: {
      sorted: true,
      unsorted: false,
      empty: false
    },
    number: 0,
    numberOfElements: 3,
    size: 20,
    empty: false
  },
  metaData: null,
  correlationId: 'fd69aa37-baab-4f42-b092-6a5800c23bcf'
}

export const filterAPI = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 14,
    pageItemCount: 14,
    pageSize: 100,
    content: [
      {
        name: 'svr',
        identifier: 'svr',
        orgIdentifier: 'default',
        projectIdentifier: 'ServiceDashboard',
        filterProperties: {
          pipelineTags: null,
          status: null,
          pipelineName: '',
          timeRange: null,
          moduleProperties: {
            ci: {},
            cd: {}
          },
          tags: {},
          filterType: 'PipelineExecution'
        },
        filterVisibility: 'OnlyCreator'
      },
      {
        name: 'svr1651031598133',
        identifier: 'svr16510315981331651031598133',
        orgIdentifier: 'default',
        projectIdentifier: 'ServiceDashboard',
        filterProperties: {
          pipelineTags: null,
          status: null,
          pipelineName: '',
          timeRange: null,
          moduleProperties: {
            ci: {},
            cd: {}
          },
          tags: {},
          filterType: 'PipelineExecution'
        },
        filterVisibility: 'OnlyCreator'
      },
      {
        name: 'svr1651031600432',
        identifier: 'svr16510316004321651031600432',
        orgIdentifier: 'default',
        projectIdentifier: 'ServiceDashboard',
        filterProperties: {
          pipelineTags: null,
          status: null,
          pipelineName: '',
          timeRange: null,
          moduleProperties: {
            ci: {},
            cd: {}
          },
          tags: {},
          filterType: 'PipelineExecution'
        },
        filterVisibility: 'OnlyCreator'
      },
      {
        name: 'svr1651031602709',
        identifier: 'svr16510316027091651031602709',
        orgIdentifier: 'default',
        projectIdentifier: 'ServiceDashboard',
        filterProperties: {
          pipelineTags: null,
          status: null,
          pipelineName: '',
          timeRange: null,
          moduleProperties: {
            ci: {},
            cd: {}
          },
          tags: {},
          filterType: 'PipelineExecution'
        },
        filterVisibility: 'OnlyCreator'
      },
      {
        name: 'svr1651031604690',
        identifier: 'svr16510316046901651031604690',
        orgIdentifier: 'default',
        projectIdentifier: 'ServiceDashboard',
        filterProperties: {
          pipelineTags: null,
          status: null,
          pipelineName: '',
          timeRange: null,
          moduleProperties: {
            ci: {},
            cd: {}
          },
          tags: {},
          filterType: 'PipelineExecution'
        },
        filterVisibility: 'OnlyCreator'
      },
      {
        name: 'svr1651031607472',
        identifier: 'svr16510316074721651031607472',
        orgIdentifier: 'default',
        projectIdentifier: 'ServiceDashboard',
        filterProperties: {
          pipelineTags: null,
          status: null,
          pipelineName: '',
          timeRange: null,
          moduleProperties: {
            ci: {},
            cd: {}
          },
          tags: {},
          filterType: 'PipelineExecution'
        },
        filterVisibility: 'OnlyCreator'
      },
      {
        name: 'svr1651031609932',
        identifier: 'svr16510316099321651031609932',
        orgIdentifier: 'default',
        projectIdentifier: 'ServiceDashboard',
        filterProperties: {
          pipelineTags: null,
          status: null,
          pipelineName: '',
          timeRange: null,
          moduleProperties: {
            ci: {},
            cd: {}
          },
          tags: {},
          filterType: 'PipelineExecution'
        },
        filterVisibility: 'OnlyCreator'
      },
      {
        name: 'svr1651031612226',
        identifier: 'svr16510316122261651031612226',
        orgIdentifier: 'default',
        projectIdentifier: 'ServiceDashboard',
        filterProperties: {
          pipelineTags: null,
          status: null,
          pipelineName: '',
          timeRange: null,
          moduleProperties: {
            ci: {},
            cd: {}
          },
          tags: {},
          filterType: 'PipelineExecution'
        },
        filterVisibility: 'OnlyCreator'
      },
      {
        name: 'svr1651031614779',
        identifier: 'svr16510316147791651031614779',
        orgIdentifier: 'default',
        projectIdentifier: 'ServiceDashboard',
        filterProperties: {
          pipelineTags: null,
          status: null,
          pipelineName: '',
          timeRange: null,
          moduleProperties: {
            ci: {},
            cd: {}
          },
          tags: {},
          filterType: 'PipelineExecution'
        },
        filterVisibility: 'OnlyCreator'
      },
      {
        name: 'svr1651031617256',
        identifier: 'svr16510316172561651031617256',
        orgIdentifier: 'default',
        projectIdentifier: 'ServiceDashboard',
        filterProperties: {
          pipelineTags: null,
          status: null,
          pipelineName: '',
          timeRange: null,
          moduleProperties: {
            ci: {},
            cd: {}
          },
          tags: {},
          filterType: 'PipelineExecution'
        },
        filterVisibility: 'OnlyCreator'
      },
      {
        name: 'svr1651031619538',
        identifier: 'svr16510316195381651031619538',
        orgIdentifier: 'default',
        projectIdentifier: 'ServiceDashboard',
        filterProperties: {
          pipelineTags: null,
          status: null,
          pipelineName: '',
          timeRange: null,
          moduleProperties: {
            ci: {},
            cd: {}
          },
          tags: {},
          filterType: 'PipelineExecution'
        },
        filterVisibility: 'OnlyCreator'
      },
      {
        name: 'svr1651031622261',
        identifier: 'svr16510316222611651031622261',
        orgIdentifier: 'default',
        projectIdentifier: 'ServiceDashboard',
        filterProperties: {
          pipelineTags: null,
          status: null,
          pipelineName: '',
          timeRange: null,
          moduleProperties: {
            ci: {},
            cd: {}
          },
          tags: {},
          filterType: 'PipelineExecution'
        },
        filterVisibility: 'OnlyCreator'
      },
      {
        name: 'svr1651031624465',
        identifier: 'svr16510316244651651031624465',
        orgIdentifier: 'default',
        projectIdentifier: 'ServiceDashboard',
        filterProperties: {
          pipelineTags: null,
          status: null,
          pipelineName: '',
          timeRange: null,
          moduleProperties: {
            ci: {},
            cd: {}
          },
          tags: {},
          filterType: 'PipelineExecution'
        },
        filterVisibility: 'OnlyCreator'
      },
      {
        name: 'svr1651031626510',
        identifier: 'svr16510316265101651031626510',
        orgIdentifier: 'default',
        projectIdentifier: 'ServiceDashboard',
        filterProperties: {
          pipelineTags: null,
          status: null,
          pipelineName: '',
          timeRange: null,
          moduleProperties: {
            ci: {},
            cd: {}
          },
          tags: {},
          filterType: 'PipelineExecution'
        },
        filterVisibility: 'OnlyCreator'
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '68e3ca75-2508-4a81-a898-4f6b5f82e5dc'
}

export const envAPI = {
  status: 'SUCCESS',
  data: {
    environment: {
      accountId: 'px7xd_BFRCi-pfWPYXVjvw',
      orgIdentifier: 'default',
      projectIdentifier: 'ServiceDashboard',
      identifier: 'Env_Test',
      name: 'Env_Test',
      description: '',
      color: '#0063F7',
      type: 'PreProduction',
      deleted: false,
      tags: {},
      yaml: 'environment:\n  orgIdentifier: "default"\n  projectIdentifier: "ServiceDashboard"\n  identifier: "Env_Test"\n  tags: {}\n  name: "Env_Test"\n  description: ""\n  type: "PreProduction"\n'
    },
    createdAt: 1663229677982,
    lastModifiedAt: 1663235157848
  },
  metaData: null,
  correlationId: 'fb6ac9dd-e351-4b80-911a-1fbc20bb986c'
}

export const activeInstanceAPI: ResponseInstanceGroupedByServiceList = {
  status: 'SUCCESS',
  data: {
    instanceGroupedByServiceList: [
      {
        serviceId: 'svc1',
        serviceName: 'svc1',
        lastDeployedAt: 500,
        instanceGroupedByArtifactList: [
          {
            artifactVersion: 'tag4',
            artifactPath: 'artifact4',
            latest: true,
            lastDeployedAt: 500,
            instanceGroupedByEnvironmentList: [
              {
                envId: 'Env_Test',
                envName: 'Env_Test',
                lastDeployedAt: 500,
                instanceGroupedByInfraList: [
                  {
                    infraIdentifier: 'infraStructure4',
                    infraName: 'infraStructure4',
                    clusterIdentifier: undefined,
                    agentIdentifier: undefined,
                    lastDeployedAt: 500,
                    instanceGroupedByPipelineExecutionList: [
                      {
                        count: 1,
                        lastPipelineExecutionId: 'pipelineLink',
                        lastPipelineExecutionName: 'pipelineLink',
                        lastDeployedAt: 500
                      },
                      {
                        count: 5,
                        lastPipelineExecutionId: 'pipelineLink2',
                        lastPipelineExecutionName: 'pipelineLink2',
                        lastDeployedAt: 498
                      }
                    ]
                  },
                  {
                    infraIdentifier: 'infra3',
                    infraName: 'infra3',
                    clusterIdentifier: undefined,
                    agentIdentifier: undefined,
                    lastDeployedAt: 499,
                    instanceGroupedByPipelineExecutionList: [
                      {
                        count: 0,
                        lastPipelineExecutionId: 'pipeline',
                        lastPipelineExecutionName: 'pipeline',
                        lastDeployedAt: 499
                      }
                    ]
                  },
                  {
                    infraIdentifier: 'infra2',
                    infraName: '',
                    clusterIdentifier: undefined,
                    agentIdentifier: undefined,
                    lastDeployedAt: 498,
                    instanceGroupedByPipelineExecutionList: [
                      {
                        count: 1,
                        lastPipelineExecutionId: 'pipeline',
                        lastPipelineExecutionName: 'pipeline',
                        lastDeployedAt: 498
                      }
                    ]
                  }
                ],
                instanceGroupedByClusterList: [
                  {
                    infraIdentifier: undefined,
                    infraName: undefined,
                    clusterIdentifier: 'clusterId1',
                    agentIdentifier: 'clusterId1',
                    lastDeployedAt: 498,
                    instanceGroupedByPipelineExecutionList: [
                      {
                        count: 5,
                        lastPipelineExecutionId: 'pipeline',
                        lastPipelineExecutionName: 'pipeline',
                        lastDeployedAt: 498
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            artifactVersion: 'tag3',
            artifactPath: 'artifact3',
            latest: false,
            lastDeployedAt: 495,
            instanceGroupedByEnvironmentList: [
              {
                envId: 'Env_Test',
                envName: 'Env_Test',
                lastDeployedAt: 495,
                instanceGroupedByInfraList: [
                  {
                    infraIdentifier: undefined,
                    infraName: undefined,
                    clusterIdentifier: undefined,
                    agentIdentifier: undefined,
                    lastDeployedAt: 495,
                    instanceGroupedByPipelineExecutionList: [
                      {
                        count: 10,
                        lastPipelineExecutionId: 'pipeline',
                        lastPipelineExecutionName: 'pipeline',
                        lastDeployedAt: 495
                      }
                    ]
                  },
                  {
                    infraIdentifier: 'infra31',
                    infraName: 'infra31',
                    clusterIdentifier: undefined,
                    agentIdentifier: undefined,
                    lastDeployedAt: 494,
                    instanceGroupedByPipelineExecutionList: [
                      {
                        count: 1,
                        lastPipelineExecutionId: 'pipeline',
                        lastPipelineExecutionName: 'pipeline',
                        lastDeployedAt: 494
                      }
                    ]
                  },
                  {
                    infraIdentifier: 'infra21',
                    infraName: 'infra21',
                    clusterIdentifier: undefined,
                    agentIdentifier: undefined,
                    lastDeployedAt: 493,
                    instanceGroupedByPipelineExecutionList: [
                      {
                        count: 1,
                        lastPipelineExecutionId: 'pipeline',
                        lastPipelineExecutionName: 'pipeline',
                        lastDeployedAt: 493
                      },
                      {
                        count: 4,
                        lastPipelineExecutionId: 'pipelines',
                        lastPipelineExecutionName: 'pipelines',
                        lastDeployedAt: 490
                      }
                    ]
                  }
                ],
                instanceGroupedByClusterList: []
              }
            ]
          },
          {
            artifactVersion: 'tag2',
            artifactPath: 'artifact2',
            latest: false,
            lastDeployedAt: 490,
            instanceGroupedByEnvironmentList: [
              {
                envId: 'Env_Test',
                envName: 'Env_Test',
                lastDeployedAt: 490,
                instanceGroupedByInfraList: [],
                instanceGroupedByClusterList: [
                  {
                    infraIdentifier: undefined,
                    infraName: undefined,
                    clusterIdentifier: 'clusterId1',
                    agentIdentifier: 'clusterId1',
                    lastDeployedAt: 498,
                    instanceGroupedByPipelineExecutionList: [
                      {
                        count: 5,
                        lastPipelineExecutionId: 'pipeline',
                        lastPipelineExecutionName: 'pipeline',
                        lastDeployedAt: 498
                      },
                      {
                        count: 6,
                        lastPipelineExecutionId: 'pipeline2',
                        lastPipelineExecutionName: 'pipeline2',
                        lastDeployedAt: 497
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        serviceId: 'svc2',
        serviceName: 'svc2',
        lastDeployedAt: 475,
        instanceGroupedByArtifactList: [
          {
            artifactVersion: 'tag4',
            artifactPath: 'artifact4',
            latest: true,
            lastDeployedAt: 475,
            instanceGroupedByEnvironmentList: [
              {
                envId: 'Env_Test',
                envName: 'Env_Test',
                lastDeployedAt: 475,
                instanceGroupedByInfraList: [
                  {
                    infraIdentifier: 'infra4',
                    infraName: 'infra4',
                    clusterIdentifier: undefined,
                    agentIdentifier: undefined,
                    lastDeployedAt: 475,
                    instanceGroupedByPipelineExecutionList: [
                      {
                        count: 1,
                        lastPipelineExecutionId: 'pipeline',
                        lastPipelineExecutionName: 'pipeline',
                        lastDeployedAt: 475
                      }
                    ]
                  }
                ],
                instanceGroupedByClusterList: []
              }
            ]
          },
          {
            artifactVersion: 'tag3',
            artifactPath: 'artifact3',
            latest: false,
            lastDeployedAt: 470,
            instanceGroupedByEnvironmentList: [
              {
                envId: 'Env_Test',
                envName: 'Env_Test',
                lastDeployedAt: 470,
                instanceGroupedByInfraList: [
                  {
                    infraIdentifier: 'infra4',
                    infraName: 'infra4',
                    clusterIdentifier: undefined,
                    agentIdentifier: undefined,
                    lastDeployedAt: 470,
                    instanceGroupedByPipelineExecutionList: [
                      {
                        count: 1,
                        lastPipelineExecutionId: 'pipeline',
                        lastPipelineExecutionName: 'pipeline',
                        lastDeployedAt: 470
                      }
                    ]
                  },
                  {
                    infraIdentifier: 'infra3',
                    infraName: 'infra3',
                    clusterIdentifier: undefined,
                    agentIdentifier: undefined,
                    lastDeployedAt: 469,
                    instanceGroupedByPipelineExecutionList: [
                      {
                        count: 1,
                        lastPipelineExecutionId: 'pipeline',
                        lastPipelineExecutionName: 'pipeline',
                        lastDeployedAt: 469
                      }
                    ]
                  },
                  {
                    infraIdentifier: 'infra2',
                    infraName: 'infra2',
                    clusterIdentifier: undefined,
                    agentIdentifier: undefined,
                    lastDeployedAt: 468,
                    instanceGroupedByPipelineExecutionList: [
                      {
                        count: 1,
                        lastPipelineExecutionId: 'pipeline',
                        lastPipelineExecutionName: 'pipeline',
                        lastDeployedAt: 468
                      }
                    ]
                  },
                  {
                    infraIdentifier: 'infra1',
                    infraName: 'infra1',
                    clusterIdentifier: undefined,
                    agentIdentifier: undefined,
                    lastDeployedAt: 467,
                    instanceGroupedByPipelineExecutionList: [
                      {
                        count: 1,
                        lastPipelineExecutionId: 'pipeline',
                        lastPipelineExecutionName: 'pipeline',
                        lastDeployedAt: 467
                      }
                    ]
                  },
                  {
                    infraIdentifier: 'infra0',
                    infraName: 'infra0',
                    clusterIdentifier: undefined,
                    agentIdentifier: undefined,
                    lastDeployedAt: 466,
                    instanceGroupedByPipelineExecutionList: [
                      {
                        count: 1,
                        lastPipelineExecutionId: 'pipeline',
                        lastPipelineExecutionName: 'pipeline',
                        lastDeployedAt: 466
                      }
                    ]
                  }
                ],
                instanceGroupedByClusterList: []
              }
            ]
          }
        ]
      },
      {
        serviceId: 'svc3',
        serviceName: 'svc3',
        lastDeployedAt: 450,
        instanceGroupedByArtifactList: [
          {
            artifactVersion: 'tag3',
            artifactPath: 'artifact3',
            latest: false,
            lastDeployedAt: 445,
            instanceGroupedByEnvironmentList: [
              {
                envId: 'Env_Test',
                envName: 'Env_Test',
                lastDeployedAt: 445,
                instanceGroupedByInfraList: [
                  {
                    infraIdentifier: 'infra44',
                    infraName: 'infra44',
                    clusterIdentifier: undefined,
                    agentIdentifier: undefined,
                    lastDeployedAt: 445,
                    instanceGroupedByPipelineExecutionList: [
                      {
                        count: 1,
                        lastPipelineExecutionId: 'pipeline12',
                        lastPipelineExecutionName: 'pipeline12',
                        lastDeployedAt: 445
                      }
                    ]
                  },
                  {
                    infraIdentifier: 'infra313',
                    infraName: 'infra313',
                    clusterIdentifier: undefined,
                    agentIdentifier: undefined,
                    lastDeployedAt: 444,
                    instanceGroupedByPipelineExecutionList: [
                      {
                        count: 1,
                        lastPipelineExecutionId: 'pipeline13',
                        lastPipelineExecutionName: 'pipeline13',
                        lastDeployedAt: 444
                      }
                    ]
                  }
                ],
                instanceGroupedByClusterList: []
              }
            ]
          },
          {
            artifactVersion: 'tag22',
            artifactPath: 'artifact22',
            latest: false,
            lastDeployedAt: 440,
            instanceGroupedByEnvironmentList: [
              {
                envId: 'Env_Test',
                envName: 'Env_Test',
                lastDeployedAt: 440,
                instanceGroupedByInfraList: [
                  {
                    infraIdentifier: 'infra4',
                    infraName: 'infra4',
                    clusterIdentifier: undefined,
                    agentIdentifier: undefined,
                    lastDeployedAt: 440,
                    instanceGroupedByPipelineExecutionList: [
                      {
                        count: 1,
                        lastPipelineExecutionId: 'pipeline',
                        lastPipelineExecutionName: 'pipeline',
                        lastDeployedAt: 440
                      }
                    ]
                  }
                ],
                instanceGroupedByClusterList: []
              }
            ]
          }
        ]
      },
      {
        serviceId: 'svc4',
        serviceName: 'svc4',
        lastDeployedAt: 400,
        instanceGroupedByArtifactList: [
          {
            artifactVersion: 'tag4',
            artifactPath: 'artifact4',
            latest: true,
            lastDeployedAt: 400,
            instanceGroupedByEnvironmentList: [
              {
                envId: 'Env_Test',
                envName: 'Env_Test',
                lastDeployedAt: 400,
                instanceGroupedByInfraList: [
                  {
                    infraIdentifier: 'infra45',
                    infraName: 'infra45',
                    clusterIdentifier: undefined,
                    agentIdentifier: undefined,
                    lastDeployedAt: 400,
                    instanceGroupedByPipelineExecutionList: [
                      {
                        count: 3,
                        lastPipelineExecutionId: 'pipeline5',
                        lastPipelineExecutionName: 'pipeline5',
                        lastDeployedAt: 400
                      }
                    ]
                  }
                ],
                instanceGroupedByClusterList: []
              }
            ]
          }
        ]
      },
      {
        serviceId: 'svc5',
        serviceName: 'svc5',
        lastDeployedAt: 400,
        instanceGroupedByArtifactList: [
          {
            artifactVersion: 'tag42',
            artifactPath: 'artifact42',
            latest: true,
            lastDeployedAt: 400,
            instanceGroupedByEnvironmentList: [
              {
                envId: 'Env_Test',
                envName: 'Env_Test',
                lastDeployedAt: 400,
                instanceGroupedByInfraList: [
                  {
                    infraIdentifier: 'infra452',
                    infraName: 'infra452',
                    clusterIdentifier: undefined,
                    agentIdentifier: undefined,
                    lastDeployedAt: 400,
                    instanceGroupedByPipelineExecutionList: [
                      {
                        count: 3,
                        lastPipelineExecutionId: 'pipeline52',
                        lastPipelineExecutionName: 'pipeline52',
                        lastDeployedAt: 400
                      }
                    ]
                  }
                ],
                instanceGroupedByClusterList: []
              }
            ]
          }
        ]
      }
    ]
  },
  metaData: undefined,
  correlationId: '6d580076-a055-450a-b9ae-867bd7377f69'
}

export const mockInstancePopoverResponse = {
  status: 'SUCCESS',
  data: {
    buildId: '',
    instances: [
      {
        podName: 'release-893b57260532de1e28c01603f3ec71620b7eadfb-todolist-llk7p',
        artifactName: '',
        connectorRef: 'account.K8sPlaygroundTest',
        infrastructureDetails: {
          namespace: 'default',
          releaseName: 'release-893b57260532de1e28c01603f3ec71620b7eadfb'
        },
        terraformInstance: null as unknown as undefined,
        deployedAt: 1643027218996,
        deployedById: 'AUTO_SCALED',
        deployedByName: 'AUTO_SCALED',
        pipelineExecutionName: 'AUTO_SCALED'
      },
      {
        podName: 'gcs-v2helm-todolist-768f49bcfb-5m6tx',
        artifactName: '',
        connectorRef: 'account.K8s_CDP_v115',
        infrastructureDetails: {
          namespace: 'default',
          releaseName: 'gcs-v2helm'
        },
        terraformInstance: null as unknown as undefined,
        deployedAt: 1643027808183,
        deployedById: '4QWHXCwYQN2dU8fVWqv3sg',
        deployedByName: 'automationpipelinesng@mailinator.com',
        pipelineExecutionName: 'v2GcsHelmChart'
      },
      {
        podName: 'v2helm-test-new-nginx-ingress-controller-7f644d49c5-v9rxk',
        artifactName: '',
        connectorRef: 'account.K8s_CDP_v115',
        infrastructureDetails: {
          namespace: 'default',
          releaseName: 'v2helm-test-new'
        },
        instanceInfoDTO: {
          helmChartInfo: {
            name: 'todolist',
            repoUrl: 'https://github.com/wings-software/PipelinesNgAutomation',
            version: '0.2.0'
          },
          helmVersion: 'V3',
          namespace: 'default',
          podName: 'v2helm-test-new-nginx-ingress-controller-7f644d49c5-v9rxk',
          releaseName: 'v2helm-test-new'
        } as NativeHelmInstanceInfoDTO,
        terraformInstance: null as unknown as undefined,
        deployedAt: 1643027303485,
        deployedById: '4QWHXCwYQN2dU8fVWqv3sg',
        deployedByName: 'automationpipelinesng@mailinator.com',
        pipelineExecutionName: 'v2Install'
      },
      {
        podName: 'release-893b57260532de1e28c01603f3ec71620b7eadfb-serverless',
        artifactName: 'serverless.zip',
        connectorRef: 'account.K8sPlaygroundTest',
        infrastructureDetails: {
          namespace: 'default',
          releaseName: 'release-893b57260532de1e28c01603f3ec71620b7eadfb'
        },
        instanceInfoDTO: {
          podName: 'release-893b57260532de1e28c01603f3ec71620b7eadfb-serverless',
          type: ServiceDeploymentType.ServerlessAwsLambda
        },
        terraformInstance: null as unknown as undefined,
        deployedAt: 1643027218996,
        deployedById: 'AUTO_SCALED',
        deployedByName: 'AUTO_SCALED',
        pipelineExecutionName: 'AUTO_SCALED'
      }
    ]
  },
  metaData: undefined,
  correlationId: 'a9d67688-9100-4e38-8da6-9852a62bc422'
}

export const noResultFoundResponse = {
  status: 'SUCCESS',
  data: {
    content: [],
    pageable: {
      sort: {
        sorted: true,
        unsorted: false,
        empty: false
      },
      pageSize: 20,
      pageNumber: 0,
      offset: 0,
      paged: true,
      unpaged: false
    },
    last: true,
    totalPages: 0,
    totalElements: 0,
    first: true,
    number: 0,
    sort: {
      sorted: true,
      unsorted: false,
      empty: false
    },
    numberOfElements: 0,
    size: 20,
    empty: true
  },
  metaData: undefined,
  correlationId: '43e07b8b-0545-44fa-8556-0018df52a041'
}
