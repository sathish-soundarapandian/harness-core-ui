/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type {
  ResponseInstanceGroupedByEnvironmentList,
  ResponsePostProdRollbackCheckDTO,
  ResponsePostProdRollbackResponseDTO
} from 'services/cd-ng'

export const singleEnvResponse: ResponseInstanceGroupedByEnvironmentList = {
  status: 'SUCCESS',
  data: {
    instanceGroupedByEnvironmentList: [
      {
        envId: 'TestEnv',
        envName: 'TestEnv',
        envGroups: [],
        instanceGroupedByEnvironmentTypeList: [
          {
            environmentType: 'PreProduction',
            instanceGroupedByInfrastructureList: [
              {
                infrastructureId: 'infra',
                infrastructureName: 'infra',
                clusterId: undefined,
                agentId: undefined,
                instanceGroupedByArtifactList: [
                  {
                    instanceKey: 'K8sInstanceKey',
                    infrastructureMappingId: 'testMapId',
                    artifact: 'artifactTestPerl',
                    count: 7,
                    lastDeployedAt: 1682673599809,
                    lastPlanExecutionId: 'testplanexec',
                    stageNodeExecutionId: 'teststagenoe',
                    pipelineIdentifier: 'k8sTestPipeline_multi',
                    stageSetupId: 'teststageid',
                    rollbackStatus: 'NOT_STARTED'
                  },
                  {
                    instanceKey: 'testKey1',
                    infrastructureMappingId: 'testid1',
                    artifact: 'artifact',
                    count: undefined,
                    lastDeployedAt: 1682673599809,
                    lastPlanExecutionId: 'testplanexec1',
                    stageNodeExecutionId: 'teststagenoe1',
                    pipelineIdentifier: 'k8sTestPipeline_multi1',
                    stageSetupId: 'teststageid1',
                    rollbackStatus: 'FAILURE'
                  },
                  {
                    instanceKey: 'testkey',
                    infrastructureMappingId: 'testid',
                    artifact: undefined,
                    count: 7,
                    lastDeployedAt: undefined,
                    lastPlanExecutionId: undefined,
                    stageNodeExecutionId: undefined,
                    pipelineIdentifier: undefined,
                    stageSetupId: undefined,
                    rollbackStatus: 'UNAVAILABLE'
                  }
                ],
                lastDeployedAt: 1682673599809
              }
            ],
            lastDeployedAt: 1682673599809
          }
        ],
        lastDeployedAt: 1682673599809
      }
    ]
  },
  metaData: undefined,
  correlationId: 'testcorrelationid'
}

export const envGroupResponse: ResponseInstanceGroupedByEnvironmentList = {
  status: 'SUCCESS',
  data: {
    instanceGroupedByEnvironmentList: [
      {
        envId: 'TestEnvGroup',
        envName: 'TestEnvGroup',
        envGroups: ['driftedGroup', 'envGroup'],
        instanceGroupedByEnvironmentTypeList: [
          {
            environmentType: 'Production',
            instanceGroupedByInfrastructureList: [
              {
                infrastructureId: 'k8sinfra',
                infrastructureName: 'k8sinfra',
                clusterId: undefined,
                agentId: undefined,
                instanceGroupedByArtifactList: [
                  {
                    instanceKey: 'K8sInstanceInfoperl',
                    infrastructureMappingId: 'testingMapIdPerl',
                    artifact: 'artifactTestPerl',
                    count: 2,
                    lastDeployedAt: 1682673688340,
                    lastPlanExecutionId: 'testplanexec',
                    stageNodeExecutionId: 'teststagenoe',
                    pipelineIdentifier: 'k8sTestPipeline_envGroup',
                    stageSetupId: 'teststageid',
                    rollbackStatus: 'SUCCESS'
                  }
                ],
                lastDeployedAt: 1682673688340
              }
            ],
            lastDeployedAt: 1682673688340
          }
        ],
        lastDeployedAt: 1682673688340
      },
      {
        envId: 'env1',
        envName: 'env1',
        envGroups: ['envGroup'],
        instanceGroupedByEnvironmentTypeList: [
          {
            environmentType: 'PreProduction',
            instanceGroupedByInfrastructureList: [
              {
                infrastructureId: 'k8sInfra',
                infrastructureName: 'k8sInfra',
                clusterId: undefined,
                agentId: undefined,
                instanceGroupedByArtifactList: [
                  {
                    instanceKey: 'K8sInstanceInfoDTOslim',
                    infrastructureMappingId: 'testMapIdSlim',
                    artifact: 'testArtifactslim',
                    count: 1,
                    lastDeployedAt: 1682526891980,
                    lastPlanExecutionId: 'testplan',
                    stageNodeExecutionId: undefined,
                    pipelineIdentifier: 'k8sTestPipeline_Group',
                    stageSetupId: undefined,
                    rollbackStatus: 'STARTED'
                  }
                ],
                lastDeployedAt: 1682526891980
              }
            ],
            lastDeployedAt: 1682526891980
          }
        ],
        lastDeployedAt: 1682526891980
      }
    ]
  },
  metaData: undefined,
  correlationId: 'testcorrelationId'
}

export const successRollbackValidation: ResponsePostProdRollbackCheckDTO = {
  status: 'SUCCESS',
  data: { message: undefined, rollbackAllowed: true },
  metaData: undefined,
  correlationId: 'testcorrelationId'
}

export const invalidRollbackValidation: ResponsePostProdRollbackCheckDTO = {
  status: 'SUCCESS',
  data: { message: 'rollback validation failed', rollbackAllowed: false },
  metaData: undefined,
  correlationId: 'testcorrelationId'
}

export const successfullRollabackTrigger: ResponsePostProdRollbackResponseDTO = {
  status: 'SUCCESS',
  data: {
    instanceKey: 'K8sInstanceInfoDTOperl',
    infraMappingId: 'testMapingId',
    planExecutionId: 'k8sTestPipeline_envGroup',
    message: undefined,
    rollbackTriggered: true
  },
  metaData: undefined,
  correlationId: 'testCorrelation'
}
