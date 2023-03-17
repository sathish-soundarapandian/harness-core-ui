/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const ciPipelineExecutionSummaryWithK8sInfra = {
  status: 'SUCCESS',
  data: {
    pipelineExecutionSummary: {
      pipelineIdentifier: 'test',
      orgIdentifier: 'default',
      projectIdentifier: 'Default_Project_1657212353481',
      planExecutionId: 'NTTS88ISTT6TkiI-TbZzsA',
      name: 'jhttp',
      status: 'Success',
      tags: [],
      moduleInfo: {
        ci: {
          infraDetailsList: [
            {
              __recast: 'io.harness.ci.pipeline.executions.beans.CIInfraDetails',
              infraType: 'KubernetesDirect',
              infraOSType: 'Linux',
              infraHostType: 'Self Hosted',
              infraArchType: 'Amd64'
            }
          ]
        }
      },
      modules: ['ci'],
      startingNodeId: 'RydRyoBCTrai4Mfg3S0Ctw',
      startTs: 1676964255820,
      endTs: 1676964351010,
      createdAt: 1676964255867
    },
    allowStageExecutions: false,
    stagesExecution: false
  },
  metaData: null,
  correlationId: '3a2afe87-eeb3-44fa-8a71-5508550bfdfe'
}

export const ciPipelineExecutionSummaryWithHostedVMsInfra = {
  status: 'SUCCESS',
  data: {
    pipelineExecutionSummary: {
      pipelineIdentifier: 'test',
      orgIdentifier: 'default',
      projectIdentifier: 'Default_Project_1657212353481',
      planExecutionId: 'NTTS88ISTT6TkiI-TbZzsA',
      name: 'jhttp',
      status: 'Success',
      tags: [],
      moduleInfo: {
        ci: {
          infraDetailsList: [
            {
              __recast: 'io.harness.ci.pipeline.executions.beans.CIInfraDetails',
              infraType: 'HostedVm',
              infraOSType: 'Linux',
              infraHostType: 'Harness Hosted',
              infraArchType: 'Amd64'
            }
          ]
        }
      },
      modules: ['ci'],
      startingNodeId: 'RydRyoBCTrai4Mfg3S0Ctw',
      startTs: 1676964255820,
      endTs: 1676964351010,
      createdAt: 1676964255867
    },
    allowStageExecutions: false,
    stagesExecution: false
  },
  metaData: null,
  correlationId: '3a2afe87-eeb3-44fa-8a71-5508550bfdfe'
}

export const cdPipelineExecutionSummary = {
  status: 'SUCCESS',
  data: {
    pipelineExecutionSummary: {
      pipelineIdentifier: 'PR_Harness_Env',
      orgIdentifier: 'default',
      projectIdentifier: 'PREQA_NG_Pipelines',
      planExecutionId: 'LicDENjATuK8Msw0A7g7jg',
      name: 'PR Harness Env',
      status: 'Running',
      moduleInfo: {
        cd: {
          __recast: 'io.harness.cdng.pipeline.executions.beans.CDStageModuleInfo',
          serviceInfo: {
            __recast: 'io.harness.cdng.pipeline.executions.beans.ServiceExecutionSummary',
            identifier: 'nguisvc',
            displayName: 'ngui-svc',
            deploymentType: 'Kubernetes',
            gitOpsEnabled: false,
            artifacts: {
              __recast: 'io.harness.cdng.pipeline.executions.beans.ServiceExecutionSummary$ArtifactsSummary',
              primary: {
                __recast: 'io.harness.cdng.artifact.GcrArtifactSummary',
                imagePath: 'platform-205701/harness/ui-feature/ui/ng',
                tag: 'latest'
              },
              sidecars: []
            }
          },
          infraExecutionSummary: {
            __recast: 'io.harness.cdng.pipeline.executions.beans.InfraExecutionSummary',
            identifier: 'prenv',
            name: 'pr-env',
            type: 'PreProduction'
          }
        }
      },
      modules: ['cd'],
      startingNodeId: 'wXPT4Z9iRsGys_YaqamcOwparallel',
      startTs: 1677705630569,
      endTs: 1677705898045,
      createdAt: 1677705635620,
      allowStageExecutions: true,
      stagesExecution: false
    }
  },
  metaData: null,
  correlationId: '232324de-0923-4d4f-8863-c4bf0ca2bc55'
}
