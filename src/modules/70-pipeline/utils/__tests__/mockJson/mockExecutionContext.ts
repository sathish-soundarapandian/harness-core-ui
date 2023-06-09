/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { GraphLayoutNode, PipelineExecutionDetail } from 'services/pipeline-ng'

export const nodeLayoutForCIStage: GraphLayoutNode = {
  nodeType: 'CI',
  nodeGroup: 'STAGE',
  nodeIdentifier: 'prdatacollectiondslcheckstyle',
  name: 'Java Builds',
  nodeUuid: 'Iw4FKBaCTsadnOuOgzGHxw',
  status: 'Failed',
  module: 'ci',
  startTs: 1686181937264,
  endTs: 1686182216191,
  edgeLayoutList: { currentNodeChildren: [], nextIds: [] },
  nodeRunInfo: {
    whenCondition: '<+OnPipelineSuccess>',
    evaluatedCondition: true,
    expressions: [{ expression: 'OnPipelineSuccess', expressionValue: 'true', count: 1 }]
  },
  failureInfo: { message: '1 error occurred:\\n\\t* exit status 1\\n\\n' },
  failureInfoDTO: {
    message: '1 error occurred:\\n\\t* exit status 1\\n\\n',
    failureTypeList: ['APPLICATION_ERROR'],
    responseMessages: []
  },
  nodeExecutionId: 'z9V7UOgdQN2fzLeDsYeL_Q',
  executionInputConfigured: false,
  isRollbackStageNode: false
}

export const nodeLayoutForCDStage: GraphLayoutNode = {
  nodeType: 'Deployment',
  nodeGroup: 'STAGE',
  nodeIdentifier: 'df',
  name: 'df',
  nodeUuid: 'EZVEuK2KTKCjn3tSUjbqqQ',
  status: 'Failed',
  module: 'cd',
  moduleInfo: {
    cd: {
      serviceInfo: {
        __recast: 'io.harness.cdng.pipeline.executions.beans.ServiceExecutionSummary',
        identifier: 'dsfasd',
        displayName: 'dsfasd',
        deploymentType: 'TAS',
        gitOpsEnabled: false,
        artifacts: {
          __recast: 'io.harness.cdng.pipeline.executions.beans.ServiceExecutionSummary$ArtifactsSummary',
          primary: {
            __recast: 'io.harness.ngpipeline.pipeline.executions.beans.GoogleCloudStorageArtifactSummary',
            bucket: 'sainath-cloud-functions-bucket',
            artifactPath: 'nodejs-docs-samples/test.zip'
          },
          artifactDisplayName: 'sainath-cloud-functions-bucket:nodejs-docs-samples/test.zip',
          sidecars: []
        }
      },
      infraExecutionSummary: {
        __recast: 'io.harness.cdng.pipeline.executions.beans.InfraExecutionSummary',
        identifier: 'sadfsdf',
        name: 'sadfsdf',
        type: 'PreProduction',
        infrastructureIdentifier: 'sadf',
        infrastructureName: 'sadf'
      }
    }
  },
  startTs: 1681881263975,
  endTs: 1681881423535,
  edgeLayoutList: { currentNodeChildren: [], nextIds: [] },
  nodeRunInfo: {
    whenCondition: '<+OnPipelineSuccess>',
    evaluatedCondition: true,
    expressions: [{ expression: 'OnPipelineSuccess', expressionValue: 'true', count: 1 }]
  },
  failureInfo: {
    message:
      'None of the active delegates were eligible to complete the task.\\n\\n ===> anshul-ng-delegate-6cdb4bffd4-sf8xj: In scope and no tag mismatch\\n ===> acrtokentestus-9484685cb-9gvrj: In scope and no tag mismatch\\n'
  },
  nodeExecutionId: 'd9PCi932Th2l97S3Nykjcw',
  executionInputConfigured: false,
  isRollbackStageNode: false
}

export const nodeLayoutForPMS: GraphLayoutNode = {
  nodeType: 'Pipeline',
  nodeGroup: 'STAGE',
  nodeIdentifier: 'generate',
  name: 'generate',
  nodeUuid: 'ev6Ix2u9QEODDQwN3Vukqw',
  status: 'Success',
  module: 'pms',
  moduleInfo: { pms: {} },
  startTs: 1686135212610,
  endTs: 1686135219776,
  edgeLayoutList: { currentNodeChildren: [], nextIds: ['i1hTX_9mTL6K5VXfA9twUA'] },
  nodeRunInfo: {
    whenCondition: '<+OnPipelineSuccess>',
    evaluatedCondition: true,
    expressions: [{ expression: 'OnPipelineSuccess', expressionValue: 'true', count: 1 }]
  },
  failureInfo: { message: '' },
  failureInfoDTO: { message: '', failureTypeList: [], responseMessages: [] },
  nodeExecutionId: 'ENsqirB9S4CgF82JdgKaUw',
  executionInputConfigured: false,
  isRollbackStageNode: false
}

export const cdStagePipelineExecutionDetails: PipelineExecutionDetail = {
  pipelineExecutionSummary: {
    pipelineIdentifier: 'rolling',
    orgIdentifier: 'default',
    projectIdentifier: 'cd_workshop',
    planExecutionId: 'K6D3aoh1QUmnKmA-dixZIQ',
    name: 'rolling',
    status: 'Failed',
    tags: [],
    executionTriggerInfo: {
      triggerType: 'MANUAL',
      triggeredBy: {
        uuid: 'nE5L7BjVTL-m6-drOBkt6w',
        identifier: 'piyush.bhuwalka@harness.io',
        extraInfo: {
          email: 'piyush.bhuwalka@harness.io'
        },
        triggerIdentifier: ''
      },
      isRerun: true,
      rerunInfo: {
        rootExecutionId: 'n8i3iT5aR6-W-4IRN4qPcQ',
        rootTriggerType: 'MANUAL',
        prevExecutionId: 'K8b8GjKtRw6zIGFf3_xH6g',
        prevTriggerType: 'MANUAL'
      }
    },
    executionErrorInfo: {
      message:
        'None of the active delegates were eligible to complete the task.\n\n ===> anshul-ng-delegate-6cdb4bffd4-sf8xj: In scope and no tag mismatch\n ===> acrtokentestus-9484685cb-9gvrj: In scope and no tag mismatch\n'
    },
    governanceMetadata: {
      id: '',
      deny: false,
      details: [],
      message: '',
      timestamp: '0',
      status: '',
      accountId: '',
      orgId: '',
      projectId: '',
      entity: '',
      type: '',
      action: '',
      created: '0'
    },
    moduleInfo: {
      cd: {
        artifactDisplayNames: ['sainath-cloud-functions-bucket:nodejs-docs-samples/test.zip'],
        envGroupIdentifiers: [],
        envIdentifiers: ['sadfsdf'],
        environmentTypes: ['PreProduction'],
        freezeIdentifiers: [],
        infrastructureIdentifiers: ['sadf'],
        infrastructureNames: ['sadf'],
        infrastructureTypes: ['KUBERNETES'],
        serviceDefinitionTypes: ['TAS'],
        serviceIdentifiers: ['dsfasd']
      }
    },
    layoutNodeMap: {
      EZVEuK2KTKCjn3tSUjbqqQ: {
        nodeType: 'Deployment',
        nodeGroup: 'STAGE',
        nodeIdentifier: 'df',
        name: 'df',
        nodeUuid: 'EZVEuK2KTKCjn3tSUjbqqQ',
        status: 'Failed',
        module: 'cd',
        moduleInfo: {
          cd: {
            serviceInfo: {
              __recast: 'io.harness.cdng.pipeline.executions.beans.ServiceExecutionSummary',
              identifier: 'dsfasd',
              displayName: 'dsfasd',
              deploymentType: 'TAS',
              gitOpsEnabled: false,
              artifacts: {
                __recast: 'io.harness.cdng.pipeline.executions.beans.ServiceExecutionSummary$ArtifactsSummary',
                primary: {
                  __recast: 'io.harness.ngpipeline.pipeline.executions.beans.GoogleCloudStorageArtifactSummary',
                  bucket: 'sainath-cloud-functions-bucket',
                  artifactPath: 'nodejs-docs-samples/test.zip'
                },
                artifactDisplayName: 'sainath-cloud-functions-bucket:nodejs-docs-samples/test.zip',
                sidecars: []
              }
            },
            infraExecutionSummary: {
              __recast: 'io.harness.cdng.pipeline.executions.beans.InfraExecutionSummary',
              identifier: 'sadfsdf',
              name: 'sadfsdf',
              type: 'PreProduction',
              infrastructureIdentifier: 'sadf',
              infrastructureName: 'sadf'
            }
          }
        },
        startTs: 1681881263975,
        endTs: 1681881423535,
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
          message:
            'None of the active delegates were eligible to complete the task.\n\n ===> anshul-ng-delegate-6cdb4bffd4-sf8xj: In scope and no tag mismatch\n ===> acrtokentestus-9484685cb-9gvrj: In scope and no tag mismatch\n'
        },
        failureInfoDTO: {
          message:
            'None of the active delegates were eligible to complete the task.\n\n ===> anshul-ng-delegate-6cdb4bffd4-sf8xj: In scope and no tag mismatch\n ===> acrtokentestus-9484685cb-9gvrj: In scope and no tag mismatch\n',
          failureTypeList: [],
          responseMessages: [
            {
              code: 'GENERAL_ERROR',
              level: 'ERROR',
              message:
                'None of the active delegates were eligible to complete the task.\n\n ===> anshul-ng-delegate-6cdb4bffd4-sf8xj: In scope and no tag mismatch\n ===> acrtokentestus-9484685cb-9gvrj: In scope and no tag mismatch\n',
              failureTypes: []
            },
            {
              code: 'GENERAL_ERROR',
              level: 'ERROR',
              message:
                'None of the active delegates were eligible to complete the task.\n\n ===> anshul-ng-delegate-6cdb4bffd4-sf8xj: In scope and no tag mismatch\n ===> acrtokentestus-9484685cb-9gvrj: In scope and no tag mismatch\n',
              failureTypes: []
            }
          ]
        },
        nodeExecutionId: 'd9PCi932Th2l97S3Nykjcw',
        executionInputConfigured: false,
        isRollbackStageNode: false
      }
    },
    modules: ['cd'],
    startingNodeId: 'EZVEuK2KTKCjn3tSUjbqqQ',
    startTs: 1681881263650,
    endTs: 1681881423770,
    createdAt: 1681881263679,
    canRetry: true,
    showRetryHistory: false,
    runSequence: 3,
    successfulStagesCount: 0,
    runningStagesCount: 0,
    failedStagesCount: 1,
    totalStagesCount: 1,
    storeType: 'INLINE',
    executionInputConfigured: false,
    parentStageInfo: {
      hasparentpipeline: false,
      stagenodeid: '',
      executionid: '',
      identifier: '',
      projectid: '',
      orgid: '',
      runsequence: 0
    },
    allowStageExecutions: false,
    executionMode: 'NORMAL',
    stagesExecution: false
  }
}

export const ciStagePipelineExecutionDetails: PipelineExecutionDetail = {
  pipelineExecutionSummary: {
    pipelineIdentifier: 'prdatacollectionfail',
    orgIdentifier: 'default',
    projectIdentifier: 'RajathaTest',
    planExecutionId: '3lwJ3FGEQLiRTpGDQUFkBw',
    name: 'Pull Request Checks',
    status: 'Failed',
    tags: [],
    executionTriggerInfo: {
      triggerType: 'MANUAL',
      triggeredBy: {
        uuid: 'r3zVtC8cT9CvOO4lV60jmA',
        identifier: 'Hemanth Kumar Mantri',
        extraInfo: {
          email: 'hemanth.mantri@harness.io'
        },
        triggerIdentifier: ''
      },
      isRerun: false
    },
    executionErrorInfo: {
      message: '1 error occurred:\n\t* exit status 1\n\n'
    },
    governanceMetadata: {
      id: '',
      deny: false,
      details: [],
      message: '',
      timestamp: '0',
      status: '',
      accountId: '',
      orgId: '',
      projectId: '',
      entity: '',
      type: '',
      action: '',
      created: '0'
    },
    moduleInfo: {
      ci: {
        ciPipelineStageModuleInfo: {
          __recast: 'io.harness.ci.plan.creator.execution.CIPipelineStageModuleInfo',
          stageExecutionId: 'z9V7UOgdQN2fzLeDsYeL_Q',
          stageId: 'prdatacollectiondslcheckstyle',
          stageName: 'Java Builds',
          cpuTime: 62033,
          stageBuildTime: 278851,
          infraType: 'HostedVm',
          osType: 'Linux',
          osArch: 'Amd64',
          startTs: 1686181937264,
          buildMultiplier: 1
        },

        ciExecutionInfoDTO: {
          __recast: 'io.harness.ci.pipeline.executions.beans.CIWebhookInfoDTO',
          event: 'branch',
          branch: {
            __recast: 'io.harness.ci.pipeline.executions.beans.CIBuildBranchHook',
            commits: [
              {
                __recast: 'io.harness.ci.pipeline.executions.beans.CIBuildCommit',
                id: '94ac03bab518b7c6ddab3c4e67928106d743859c',
                link: 'https://github.com/wings-software/datacollection-dsl/commit/94ac03bab518b7c6ddab3c4e67928106d743859c',
                message: '[OIP-443]: changed random String gen to epochMillis for uniqueness.',
                ownerName: 'Ansuman Satapathy',
                ownerId: 'n00bitax',
                ownerEmail: 'ansuman.satapathy@harness.io',
                timeStamp: 1684997170000
              }
            ]
          }
        },
        imageDetailsList: [
          {
            __recast: 'io.harness.ci.pipeline.executions.beans.CIImageDetails',
            imageName: 'harness/drone-git',
            imageTag: '1.3.3'
          },
          {
            __recast: 'io.harness.ci.pipeline.executions.beans.CIImageDetails',
            imageName: 'maven',
            imageTag: '3.6.3-jdk-8'
          }
        ],
        infraDetailsList: [
          {
            __recast: 'io.harness.ci.pipeline.executions.beans.CIInfraDetails',
            infraType: 'HostedVm',
            infraOSType: 'Linux',
            infraHostType: 'Harness Hosted',
            infraArchType: 'Amd64'
          }
        ],
        scmDetailsList: [
          {
            __recast: 'io.harness.ci.pipeline.executions.beans.CIScmDetails',
            scmUrl: 'https://github.com/',
            scmProvider: 'Github',
            scmAuthType: 'Http',
            scmHostType: 'SaaS'
          }
        ],
        tiBuildDetailsList: [
          {
            __recast: 'io.harness.ci.pipeline.executions.beans.TIBuildDetails',
            buildTool: 'Maven',
            language: 'Java'
          }
        ]
      }
    },
    layoutNodeMap: {
      ysBJmopfRhCDlK4ikpR8AA: {
        nodeType: 'PipelineRollback',
        nodeGroup: 'STAGE',
        nodeIdentifier: 'prb-kVwpg_kHQ_a4VSM0j0EdBw',
        name: 'Pipeline Rollback',
        nodeUuid: 'ysBJmopfRhCDlK4ikpR8AA',
        status: 'NotStarted',
        module: 'pms',
        moduleInfo: {
          pms: {}
        },
        edgeLayoutList: {
          currentNodeChildren: [],
          nextIds: []
        },
        isRollbackStageNode: false
      },
      Iw4FKBaCTsadnOuOgzGHxw: {
        nodeType: 'CI',
        nodeGroup: 'STAGE',
        nodeIdentifier: 'prdatacollectiondslcheckstyle',
        name: 'Java Builds',
        nodeUuid: 'Iw4FKBaCTsadnOuOgzGHxw',
        status: 'Failed',
        module: 'ci',
        moduleInfo: {
          ci: {}
        },
        startTs: 1686181937264,
        endTs: 1686182216191,
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
          message: '1 error occurred:\n\t* exit status 1\n\n'
        },
        failureInfoDTO: {
          message: '1 error occurred:\n\t* exit status 1\n\n',
          failureTypeList: ['APPLICATION_ERROR'],
          responseMessages: []
        },
        nodeExecutionId: 'z9V7UOgdQN2fzLeDsYeL_Q',
        executionInputConfigured: false,
        isRollbackStageNode: false
      }
    },
    modules: ['pms', 'ci'],
    startingNodeId: 'Iw4FKBaCTsadnOuOgzGHxw',
    startTs: 1686181937077,
    endTs: 1686182216531,
    createdAt: 1686181937114,
    canRetry: true,
    showRetryHistory: false,
    runSequence: 4,
    successfulStagesCount: 0,
    runningStagesCount: 0,
    failedStagesCount: 1,
    totalStagesCount: 1,
    storeType: 'INLINE',
    executionInputConfigured: false,
    parentStageInfo: {
      hasparentpipeline: false,
      stagenodeid: '',
      executionid: '',
      identifier: '',
      projectid: '',
      orgid: '',
      runsequence: 0
    },
    allowStageExecutions: false,
    executionMode: 'NORMAL',
    stagesExecution: false
  }
}
