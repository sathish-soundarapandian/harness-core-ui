const accountId = 'accountId'
const project = 'project1'
const org = 'default'
const pipelineIdentifier = 'testPipeline_Cypress'
const ENV = 'prod'

export const deploymentActivitySummaryAPI = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-activity-summary?routingId=${accountId}&accountId=${accountId}`
export const deploymentTimeseriesDataAPI = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-timeseries-data?routingId=${accountId}&accountId=${accountId}&anomalousMetricsOnly=*&anomalousNodesOnly=*&pageNumber=0&pageSize=10`
export const deploymentTimeseriesDataWithNodeFilterAPI = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-timeseries-data?routingId=${accountId}&accountId=${accountId}&anomalousMetricsOnly=*&anomalousNodesOnly=*&hostNames=harness-deployment-canary-7445f86dbf-ml857&pageNumber=0&pageSize=10`
export const healthSourceAPI = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/healthSources?routingId=${accountId}&accountId=${accountId}`
export const nodeNamesFilterAPI = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/all-node-names?routingId=${accountId}&accountId=${accountId}`
export const transactionsFilterAPI = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/all-transaction-names?routingId=${accountId}&accountId=${accountId}`
export const deploymentTimeseriesDataWithFilters = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-timeseries-data?routingId=${accountId}&accountId=${accountId}&anomalousMetricsOnly=true&anomalousNodesOnly=true&hostNames=harness-deployment-canary-7445f86dbf-ml857&pageNumber=0&pageSize=10&healthSources=appd_prod%2Fappdtest&transactionNames=%2Ftodolist%2Fregister`
export const strategies = `/ng/api/pipelines/configuration/strategies?routingId=${accountId}`
export const strategiesYamlSnippets = `/ng/api/pipelines/configuration/strategies/yaml-snippets?routingId=${accountId}&serviceDefinitionType=Kubernetes&strategyType=Rolling`
export const variables = `/pipeline/api/pipelines/v2/variables?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}`
export const strategiesYamlSnippets2 = `/ng/api/pipelines/configuration/strategies/yaml-snippets?routingId=${accountId}&strategyType=Rolling`
export const strategiesYamlSnippets3 = `/ng/api/pipelines/configuration/strategies/yaml-snippets?routingId=accountId&serviceDefinitionType=Kubernetes&strategyType=Rolling`
export const pipelineSteps = `/pipeline/api/pipelines/v2/steps?routingId=${accountId}&accountId=${accountId}`
export const monitoresServices = `/cv/api/monitored-service/service-environment?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}&environmentIdentifier=*&serviceIdentifier=*`
export const servicesCall = `/ng/api/servicesV2?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}`
export const servicesCallV2 = `/ng/api/servicesV2/list/access?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}`
export const stagesExecutionList = `/pipeline/api/pipeline/execute/stagesExecutionList?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}&pipelineIdentifier=${pipelineIdentifier}`
export const inputSetsCall = `/pipeline/api/inputSets/template?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}&pipelineIdentifier=${pipelineIdentifier}`
export const applyTemplatesCall = `/template/api/templates/applyTemplates?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&pipelineIdentifier=${pipelineIdentifier}&projectIdentifier=${project}&getDefaultFromOtherRepo=true`
export const pipelineDetailsCall = `/pipeline/api/pipelines/${pipelineIdentifier}?accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}`
export const pipelineDetailsWithRoutingIdCall = `/pipeline/api/pipelines/${pipelineIdentifier}?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}`
export const templateResolvedPipeline = `/pipeline/api/pipelines/testPipeline_Cypress?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}&getTemplatesResolvedPipeline=true`
export const inputSetsTemplateCall = `/pipeline/api/inputSets/template?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&pipelineIdentifier=${pipelineIdentifier}&projectIdentifier=${project}`
export const pipelineSummaryCall = `/pipeline/api/pipelines/summary/${pipelineIdentifier}?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}`
export const inputSetTemplateForRuntimeServiceCall = `/cv/api/verify-step/input-set-template?accountId=${accountId}`
export const serviceEnvironmentTest1Call = `/cv/api/monitored-service/service-environment?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}&environmentIdentifier=${ENV}&serviceIdentifier=testService`
export const serviceEnvironmentTest2Call = `/cv/api/monitored-service/service-environment?routingId=accountId&accountId=accountId&orgIdentifier=default&projectIdentifier=project1&environmentIdentifier=prod&serviceIdentifier=testService2`
export const serviceEnvironmentTest3Call = `/cv/api/monitored-service/service-environment?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}&environmentIdentifier=${ENV}&serviceIdentifier=testService3`

// git sync call
export const gitSyncCall = `/ng/api/git-sync?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${org}&projectIdentifier=${project}`
export const aggregateProjectsCall = `/ng/api/aggregate/projects?routingId=${accountId}&accountIdentifier=${accountId}&pageIndex=0&pageSize=50`
export const sourceCodeManagerCall = `/ng/api/source-code-manager?routingId=${accountId}&accountIdentifier=${accountId}`

// logs initial call
export const logsListCall = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-log-analysis-radar-chart-data?routingId=${accountId}&accountId=${accountId}&pageNumber=0&pageSize=10&minAngle=0&maxAngle=360&clusterTypes=UNKNOWN_EVENT&clusterTypes=UNEXPECTED_FREQUENCY`
export const logsRadarChartDataCall = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-log-analysis-radar-chart-clusters?routingId=${accountId}&accountId=${accountId}&clusterTypes=UNKNOWN_EVENT&clusterTypes=UNEXPECTED_FREQUENCY`

// logs node filter call
export const logsListNodeFilterCall = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-log-analysis-radar-chart-data?routingId=${accountId}&accountId=${accountId}&pageNumber=0&pageSize=10&hostNames=harness-deployment-canary-7445f86dbf-ml857&minAngle=0&maxAngle=360&clusterTypes=UNKNOWN_EVENT&clusterTypes=UNEXPECTED_FREQUENCY`
export const logsRadarChartDataNodeFilterCall = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-log-analysis-radar-chart-clusters?routingId=${accountId}&accountId=${accountId}&hostNames=harness-deployment-canary-7445f86dbf-ml857&clusterTypes=UNKNOWN_EVENT&clusterTypes=UNEXPECTED_FREQUENCY`

// logs cluster type filter call
export const logsListCLusterFilterCall = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-log-analysis-radar-chart-data?routingId=${accountId}&accountId=${accountId}&pageNumber=0&pageSize=10&minAngle=0&maxAngle=360&clusterTypes=UNEXPECTED_FREQUENCY`
export const logsRadarChartDataCLusterFilterCall = `/cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-log-analysis-radar-chart-clusters?routingId=${accountId}&accountId=${accountId}&clusterTypes=UNEXPECTED_FREQUENCY`

// logs min slider filter
export const logsListMinSliderFilterCall = `cv/api/verify-step/GZNwefkdR2aBhc7owmJ1-w/deployment-log-analysis-radar-chart-data?routingId=${accountId}&accountId=${accountId}&pageNumber=0&pageSize=10&minAngle=30&maxAngle=360&clusterTypes=UNEXPECTED_FREQUENCY`

export const strategiesResponse = {
  status: 'SUCCESS',
  data: { Kubernetes: ['Rolling', 'BlueGreen', 'Canary', 'Default'], NativeHelm: ['Rolling', 'Default'] },
  metaData: null,
  correlationId: 'b4f7260b-9bed-4a21-a2a5-02c23dd573d8'
}
export const strategiesYamlSnippetsResponse = {
  status: 'SUCCESS',
  data: 'failureStrategies:\n  - onFailure:\n      errors:\n        - AllErrors\n      action:\n        type: StageRollback\nspec:\n  execution:\n    steps:\n      - step:\n          name: "Rollout Deployment"\n          identifier: rolloutDeployment\n          type: K8sRollingDeploy\n          timeout: 10m\n          spec:\n            skipDryRun: false\n    rollbackSteps:\n      - step:\n          name: "Rollback Rollout Deployment"\n          identifier: rollbackRolloutDeployment\n          type: K8sRollingRollback\n          timeout: 10m\n          spec: {}\n',
  metaData: null,
  correlationId: '8f395970-533d-43ba-a6c1-0d8a8b6019fb'
}

export const variablesPostResponse = {
  status: 'SUCCESS',
  data: {
    yaml: '---\npipeline:\n  name: "d0XP7wPYS92z7RNPJXBxBQ"\n  identifier: "test"\n  allowStageExecutions: "iAtVkGtNTfuApiM1y4pz7w"\n  projectIdentifier: "cNeuGlV-SxGBenQQnjirmw"\n  orgIdentifier: "GaWiGX3KStWLsidc-pmC2A"\n  description: "aHMFuVqQQXiIJrcyKJ0F1g"\n  tags:\n    __uuid: "ZZzfrY0xRe2TQUxD4zXQcg"\n  stages:\n  - stage:\n      name: "FpiyiPgnRta6m9VKPc6Vbg"\n      identifier: "test"\n      description: "4ohKeTljQ8uoVDK5NZXelA"\n      type: "Deployment"\n      spec:\n        serviceConfig:\n          serviceRef: "HKHACGfEScK1RcgpU4N7tA"\n          serviceDefinition:\n            type: "Kubernetes"\n            spec:\n              variables: []\n              __uuid: "M4d9qLcXRNm38IQl7AynrQ"\n            __uuid: "udO8BaK6RB2L8Ri3I4GfHg"\n          __uuid: "ZnH8Xo_rR3SffIcBRhJeKA"\n        infrastructure:\n          environmentRef: "t989wKT2Tcu10voxjpaLVw"\n          infrastructureDefinition:\n            type: "KubernetesDirect"\n            spec:\n              connectorRef: "K5JSINa9QxmC9OcJFRFD-Q"\n              namespace: "RJnwaHacRL-V4QvMi0A-Gg"\n              releaseName: "jJnmTM44SYuEXn0gfVKUDQ"\n              __uuid: "NDFruwtPQaG2Zfn4TYl-kA"\n            __uuid: "KAU4ecz2QQyqH9BmZhs0jw"\n          allowSimultaneousDeployments: "ZMT--U0oQEGNm2NmRKX4vg"\n          __uuid: "0Luzc_eKRWGURvqYH46WKw"\n        execution:\n          steps: []\n          rollbackSteps: []\n          __uuid: "UM7Uj0OdS5anWwnRkkJeFQ"\n        __uuid: "BpxR-OwMSQKPmeUj7CUgPQ"\n      tags:\n        __uuid: "WVfC96NfQqSLMMiuDrFvGg"\n      failureStrategies:\n      - onFailure:\n          errors: "NQoDZc7_QlOxvVYZtM_9zg"\n          action:\n            type: "StageRollback"\n            __uuid: "XOTP_IvkT9mrjNx2B_9spw"\n          __uuid: "UDGod4TVQLS_qVtVzirmhg"\n        __uuid: "LnqpJ5NoRYat8rERBHJQDA"\n      __uuid: "akWnlMAwRYWWIPuZifTxTQ"\n    __uuid: "gDAS3m1MTxqm07sAeILKpw"\n  __uuid: "f0614r79QC2FN73Ttzne8w"\n__uuid: "z6jIOZP5SRq_q3QNreHGAA"\n',
    metadataMap: {
      d0XP7wPYS92z7RNPJXBxBQ: {
        yamlProperties: {
          fqn: 'pipeline.name',
          localName: 'pipeline.name'
        },
        yamlOutputProperties: null
      },
      f0614r79QC2FN73Ttzne8w: {
        yamlProperties: {
          fqn: 'pipeline',
          localName: 'pipeline'
        },
        yamlOutputProperties: null
      },
      aHMFuVqQQXiIJrcyKJ0F1g: {
        yamlProperties: {
          fqn: 'pipeline.description',
          localName: 'pipeline.description'
        },
        yamlOutputProperties: null
      },
      akWnlMAwRYWWIPuZifTxTQ: {
        yamlProperties: {
          fqn: 'pipeline.stages.test',
          localName: 'stage'
        },
        yamlOutputProperties: null
      },
      FpiyiPgnRta6m9VKPc6Vbg: {
        yamlProperties: {
          fqn: 'pipeline.stages.test.name',
          localName: 'stage.name'
        },
        yamlOutputProperties: null
      },
      '0Luzc_eKRWGURvqYH46WKw': {
        yamlProperties: {
          fqn: 'infrastructure',
          localName: ''
        },
        yamlOutputProperties: null
      },
      'RJnwaHacRL-V4QvMi0A-Gg': {
        yamlProperties: {
          fqn: 'pipeline.stages.test.spec.infrastructure.infrastructureDefinition.spec.namespace',
          localName: 'infrastructure.infrastructureDefinition.spec.namespace'
        },
        yamlOutputProperties: null
      },
      HKHACGfEScK1RcgpU4N7tA: {
        yamlProperties: {
          fqn: 'pipeline.stages.test.spec.serviceConfig.serviceRef',
          localName: 'serviceConfig.serviceRef'
        },
        yamlOutputProperties: null
      },
      'K5JSINa9QxmC9OcJFRFD-Q': {
        yamlProperties: {
          fqn: 'pipeline.stages.test.spec.infrastructure.infrastructureDefinition.spec.connectorRef',
          localName: 'infrastructure.infrastructureDefinition.spec.connectorRef'
        },
        yamlOutputProperties: null
      },
      '4ohKeTljQ8uoVDK5NZXelA': {
        yamlProperties: {
          fqn: 'pipeline.stages.test.description',
          localName: 'stage.description'
        },
        yamlOutputProperties: null
      },
      ZnH8Xo_rR3SffIcBRhJeKA: {
        yamlProperties: {
          fqn: 'serviceConfig',
          localName: ''
        },
        yamlOutputProperties: null
      },
      t989wKT2Tcu10voxjpaLVw: {
        yamlProperties: {
          fqn: 'pipeline.stages.test.spec.infrastructure.environmentRef',
          localName: 'infrastructure.environmentRef'
        },
        yamlOutputProperties: null
      },
      jJnmTM44SYuEXn0gfVKUDQ: {
        yamlProperties: {
          fqn: 'pipeline.stages.test.spec.infrastructure.infrastructureDefinition.spec.releaseName',
          localName: 'infrastructure.infrastructureDefinition.spec.releaseName'
        },
        yamlOutputProperties: null
      }
    },
    errorResponses: null,
    serviceExpressionPropertiesList: []
  },
  metaData: null,
  correlationId: 'fa70b7e0-bee4-404c-82b5-9eb09759fb0d'
}
export const variablesV2PostResponse = {
  status: 'SUCCESS',
  data: {
    yaml: '---\npipeline:\n  name: "x52Xrz5BSZ-ckdWRwfsMww"\n  identifier: "test"\n  projectIdentifier: "piHF9zptQTyonoEJphQyYQ"\n  orgIdentifier: "nwPJLY29QO2j5tjdr5Va_Q"\n  description: "8LLlShTRQh2gX_RA-PUqlQ"\n  tags:\n    __uuid: "vik35xpNSr-PqSymogVOsQ"\n  stages:\n  - stage:\n      name: "7am3z0odRDSUSyncafo55A"\n      identifier: "testStage"\n      description: "VizT_CrBSoCnUoqw7mA56g"\n      type: "Deployment"\n      spec:\n        serviceConfig:\n          serviceRef: "rDTqDHIDShKcQQm9z4H_wg"\n          serviceDefinition:\n            type: "Kubernetes"\n            spec:\n              variables: []\n              __uuid: "-EGvxgSMRzmILcNjV4YrMg"\n            __uuid: "gaEzi70mTLij9390k94Bsg"\n          __uuid: "CUywuYhiQXO6OQH1-qctQg"\n        infrastructure:\n          environmentRef: "WXMHm4XpTn-NVo_iTQbcRQ"\n          infrastructureDefinition:\n            type: "KubernetesDirect"\n            __uuid: "2qrP1TeJSsWBhGfKgoOw5A"\n          allowSimultaneousDeployments: "U60cOAXMRfev4IIqaDKo0g"\n          __uuid: "0outuzElSA23LsD-SeqvVQ"\n        __uuid: "L_yNZ7nDRxuSO7jMXt8DbA"\n      tags:\n        __uuid: "WDh9yVb5QKuW0ukTZIMLew"\n      failureStrategies:\n      - onFailure:\n          errors: "v4KPoINyR7WzDxt1--U8tQ"\n          action:\n            type: "StageRollback"\n            __uuid: "el_033ZoSlmzlQV_JTGgdg"\n          __uuid: "bMOdOpkwSLyMi9A5sg0qBw"\n        __uuid: "iZ-uUkA0RC6Q-WTLU3Ogrw"\n      __uuid: "DX-0-mXHSn2mPhB_oVAVrQ"\n    __uuid: "zlZbUozRSnum8HjCPenOoQ"\n  __uuid: "QVdl321CSIq3RWzYOxIVVQ"\n__uuid: "LHYW-b81RKSPkEATVhUSyQ"\n',
    metadataMap: {
      'x52Xrz5BSZ-ckdWRwfsMww': {
        yamlProperties: {
          fqn: 'pipeline.name',
          localName: 'pipeline.name',
          variableName: 'name',
          aliasFQN: '',
          visible: true
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      'vik35xpNSr-PqSymogVOsQ': {
        yamlProperties: {
          fqn: 'pipeline.tags',
          localName: 'pipeline.tags',
          variableName: 'tags',
          aliasFQN: '',
          visible: true
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      QVdl321CSIq3RWzYOxIVVQ: {
        yamlProperties: {
          fqn: 'pipeline',
          localName: 'pipeline',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      '8LLlShTRQh2gX_RA-PUqlQ': {
        yamlProperties: {
          fqn: 'pipeline.description',
          localName: 'pipeline.description',
          variableName: 'description',
          aliasFQN: '',
          visible: true
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      '0outuzElSA23LsD-SeqvVQ': {
        yamlProperties: {
          fqn: 'infrastructure',
          localName: '',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      rDTqDHIDShKcQQm9z4H_wg: {
        yamlProperties: {
          fqn: 'pipeline.stages.testStage.spec.serviceConfig.serviceRef',
          localName: 'serviceConfig.serviceRef',
          variableName: 'serviceRef',
          aliasFQN: '',
          visible: true
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      'DX-0-mXHSn2mPhB_oVAVrQ': {
        yamlProperties: {
          fqn: 'pipeline.stages.testStage',
          localName: 'stage',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      '7am3z0odRDSUSyncafo55A': {
        yamlProperties: {
          fqn: 'pipeline.stages.testStage.name',
          localName: 'stage.name',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      'WXMHm4XpTn-NVo_iTQbcRQ': {
        yamlProperties: {
          fqn: 'pipeline.stages.testStage.spec.infrastructure.environmentRef',
          localName: 'infrastructure.environmentRef',
          variableName: 'environmentRef',
          aliasFQN: '',
          visible: true
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      'CUywuYhiQXO6OQH1-qctQg': {
        yamlProperties: {
          fqn: 'serviceConfig',
          localName: '',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      },
      VizT_CrBSoCnUoqw7mA56g: {
        yamlProperties: {
          fqn: 'pipeline.stages.testStage.description',
          localName: 'stage.description',
          variableName: '',
          aliasFQN: '',
          visible: false
        },
        yamlOutputProperties: null,
        yamlExtraProperties: null
      }
    },
    errorResponses: null,
    serviceExpressionPropertiesList: [
      { serviceName: 'trigger', expression: 'trigger.targetBranch' },
      { serviceName: 'trigger', expression: 'trigger.sourceBranch' },
      { serviceName: 'trigger', expression: 'trigger.prNumber' },
      { serviceName: 'trigger', expression: 'trigger.prTitle' }
    ]
  },
  metaData: null,
  correlationId: 'a93159ac-9077-4f7d-832d-d89ef2a636ee'
}

export const pipelineStepsResponse = {
  status: 'SUCCESS',
  data: {
    name: 'Library',
    stepsData: [],
    stepCategories: [
      {
        name: 'Continuous Deployment',
        stepsData: [],
        stepCategories: [
          {
            name: 'Kubernetes',
            stepsData: [
              {
                name: 'BG Swap Services',
                type: 'K8sBGSwapServices',
                disabled: false,
                featureRestrictionName: 'K8S_BG_SWAP_SERVICES'
              },
              {
                name: 'Stage Deployment',
                type: 'K8sBlueGreenDeploy',
                disabled: false,
                featureRestrictionName: 'K8S_BLUE_GREEN_DEPLOY'
              },
              { name: 'Apply', type: 'K8sApply', disabled: false, featureRestrictionName: 'K8S_APPLY' },
              { name: 'Delete', type: 'K8sDelete', disabled: false, featureRestrictionName: 'K8S_DELETE' },
              {
                name: 'Canary Delete',
                type: 'K8sCanaryDelete',
                disabled: false,
                featureRestrictionName: 'K8S_CANARY_DELETE'
              },
              {
                name: 'Rolling Deployment',
                type: 'K8sRollingDeploy',
                disabled: false,
                featureRestrictionName: 'K8S_ROLLING_DEPLOY'
              },
              {
                name: 'Canary Deployment',
                type: 'K8sCanaryDeploy',
                disabled: false,
                featureRestrictionName: 'K8S_CANARY_DEPLOY'
              },
              { name: 'Scale', type: 'K8sScale', disabled: false, featureRestrictionName: 'K8S_SCALE' },
              {
                name: 'Rolling Rollback',
                type: 'K8sRollingRollback',
                disabled: false,
                featureRestrictionName: 'K8S_ROLLING_ROLLBACK'
              }
            ],
            stepCategories: []
          },
          {
            name: 'Terraform',
            stepsData: [
              {
                name: 'Terraform Destroy',
                type: 'TerraformDestroy',
                disabled: false,
                featureRestrictionName: 'TERRAFORM_DESTROY'
              },
              {
                name: 'Terraform Rollback',
                type: 'TerraformRollback',
                disabled: false,
                featureRestrictionName: 'TERRAFORM_ROLLBACK'
              },
              {
                name: 'Terraform Apply',
                type: 'TerraformApply',
                disabled: false,
                featureRestrictionName: 'TERRAFORM_APPLY'
              },
              {
                name: 'Terraform Plan',
                type: 'TerraformPlan',
                disabled: false,
                featureRestrictionName: 'TERRAFORM_PLAN'
              }
            ],
            stepCategories: []
          },
          {
            name: 'Utilities',
            stepsData: [],
            stepCategories: [
              {
                name: 'Scripted',
                stepsData: [
                  { name: 'Shell Script', type: 'ShellScript', disabled: false, featureRestrictionName: null }
                ],
                stepCategories: []
              },
              {
                name: 'Non-Scripted',
                stepsData: [{ name: 'Http', type: 'Http', disabled: false, featureRestrictionName: null }],
                stepCategories: []
              }
            ]
          },
          {
            name: 'Approval',
            stepsData: [
              {
                name: 'Harness Approval',
                type: 'HarnessApproval',
                disabled: false,
                featureRestrictionName: 'INTEGRATED_APPROVALS_WITH_HARNESS_UI'
              },
              {
                name: 'Jira Approval',
                type: 'JiraApproval',
                disabled: false,
                featureRestrictionName: 'INTEGRATED_APPROVALS_WITH_JIRA'
              }
            ],
            stepCategories: []
          },
          {
            name: 'Jira',
            stepsData: [
              {
                name: 'Jira Create',
                type: 'JiraCreate',
                disabled: false,
                featureRestrictionName: 'INTEGRATED_APPROVALS_WITH_JIRA'
              },
              {
                name: 'Jira Update',
                type: 'JiraUpdate',
                disabled: false,
                featureRestrictionName: 'INTEGRATED_APPROVALS_WITH_JIRA'
              }
            ],
            stepCategories: []
          },
          {
            name: 'FlowControl',
            stepsData: [],
            stepCategories: [
              {
                name: 'Barrier',
                stepsData: [{ name: 'Barrier', type: 'Barrier', disabled: false, featureRestrictionName: null }],
                stepCategories: []
              }
            ]
          }
        ]
      },
      {
        name: 'Continuous Verification',
        stepsData: [],
        stepCategories: [
          {
            name: 'Continuous Verification',
            stepsData: [{ name: 'Verify', type: 'Verify', disabled: false, featureRestrictionName: null }],
            stepCategories: []
          }
        ]
      }
    ]
  },
  metaData: null,
  correlationId: '8f5b8513-dc74-4bf7-a36c-228fe7e3c4c4'
}

export const monitoresServicesResponse = {
  status: 'SUCCESS',
  data: {
    createdAt: 1641552686531,
    lastModifiedAt: 1642054520322,
    monitoredService: {
      orgIdentifier: 'default',
      projectIdentifier: 'shaswat',
      identifier: 'appd_prod',
      name: 'appd_prod',
      type: 'Application',
      description: '',
      serviceRef: 'appd',
      environmentRef: 'prod',
      environmentRefList: null,
      tags: {},
      sources: {
        healthSources: [
          {
            name: 'appd-test',
            identifier: 'appdtest',
            type: 'AppDynamics',
            spec: {
              connectorRef: 'appdtest',
              feature: 'Application Monitoring',
              applicationName: 'cv-app',
              tierName: '1415279',
              metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }],
              metricDefinitions: []
            }
          }
        ],
        changeSources: [
          {
            name: 'Harness CD Next Gen',
            identifier: 'harness_cd_next_gen',
            type: 'HarnessCDNextGen',
            enabled: true,
            spec: {},
            category: 'Deployment'
          }
        ]
      },
      dependencies: []
    }
  },
  metaData: null,
  correlationId: 'd986946a-3521-4648-a787-53150e21aed7'
}

export const monitoresServicesResponseWithNoHealthSource = {
  status: 'SUCCESS',
  data: {
    createdAt: 1641552686531,
    lastModifiedAt: 1642054520322,
    monitoredService: {
      orgIdentifier: 'default',
      projectIdentifier: 'shaswat',
      identifier: 'appd_prod',
      name: 'appd_prod',
      type: 'Application',
      description: '',
      serviceRef: 'appd',
      environmentRef: 'prod',
      environmentRefList: null,
      tags: {},
      sources: {
        healthSources: [],
        changeSources: [
          {
            name: 'Harness CD Next Gen',
            identifier: 'harness_cd_next_gen',
            type: 'HarnessCDNextGen',
            enabled: true,
            spec: {},
            category: 'Deployment'
          }
        ]
      },
      dependencies: []
    }
  },
  metaData: null,
  correlationId: 'd986946a-3521-4648-a787-53150e21aed7'
}

export const serviceEnvironmentNoMonitoredServicesResponse = {
  status: 'SUCCESS',
  data: null,
  metaData: null,
  correlationId: 'c8c2a3e5-4f73-4c03-8193-1dc7d99858d1'
}

export const stagesExecutionListResponse = {
  status: 'SUCCESS',
  data: [],
  metaData: null,
  correlationId: 'abe8947c-2acf-4905-bac1-732540adf73c'
}

export const inputSetsResponse = {
  status: 'SUCCESS',
  data: { totalPages: 0, totalItems: 0, pageItemCount: 0, pageSize: 100, content: [], pageIndex: 0, empty: true },
  metaData: null,
  correlationId: '21c2bd0f-b40d-4b8b-8cdf-c7b734ed2699'
}

export const inputSetsTemplateCallResponse = {
  status: 'SUCCESS',
  data: { modules: ['cd'], hasInputSets: false },
  metaData: null,
  correlationId: '570b47b8-1237-401a-bf63-9e1b01575cc6'
}

export const applyTemplatesResponse = {
  status: 'SUCCESS',
  data: {
    mergedPipelineYaml:
      'name: "testPipeline_Cypress"\nidentifier: "testPipeline_Cypress"\nallowStageExecutions: false\nprojectIdentifier: "project1"\norgIdentifier: "CVNG"\ntags: {}\nstages:\n- stage:\n    name: "testStage_Cypress"\n    identifier: "testStage_Cypress"\n    description: ""\n    type: "Deployment"\n    spec:\n      serviceConfig:\n        serviceRef: "appd"\n        serviceDefinition:\n          type: "Kubernetes"\n          spec:\n            variables: []\n      infrastructure:\n        environmentRef: "prod"\n        infrastructureDefinition:\n          type: "KubernetesDirect"\n          spec:\n            connectorRef: "testk8s"\n            namespace: "testStage_Cypress"\n            releaseName: "release-<+INFRA_KEY>"\n        allowSimultaneousDeployments: false\n      execution:\n        steps:\n        - step:\n            name: "Rollout Deployment"\n            identifier: "rolloutDeployment"\n            type: "K8sRollingDeploy"\n            timeout: "10m"\n            spec:\n              skipDryRun: false\n        - step:\n            type: "Verify"\n            name: "testStage_Cypress"\n            identifier: "testStage_Cypress"\n            spec:\n              type: "Rolling"\n              spec:\n                sensitivity: "HIGH"\n                duration: "5m"\n                deploymentTag: "<+serviceConfig.artifacts.primary.tag>"\n            timeout: "2h"\n            failureStrategies:\n            - onFailure:\n                errors:\n                - "Verification"\n                action:\n                  type: "ManualIntervention"\n                  spec:\n                    timeout: "2h"\n                    onTimeout:\n                      action:\n                        type: "StageRollback"\n            - onFailure:\n                errors:\n                - "Unknown"\n                action:\n                  type: "ManualIntervention"\n                  spec:\n                    timeout: "2h"\n                    onTimeout:\n                      action:\n                        type: "Ignore"\n        rollbackSteps:\n        - step:\n            name: "Rollback Rollout Deployment"\n            identifier: "rollbackRolloutDeployment"\n            type: "K8sRollingRollback"\n            timeout: "10m"\n            spec: {}\n    tags: {}\n    failureStrategies:\n    - onFailure:\n        errors:\n        - "AllErrors"\n        action:\n          type: "StageRollback"\n',
    templateReferenceSummaries: []
  },
  metaData: null,
  correlationId: '689276a7-cb66-4c8e-af74-de05cedb37ee'
}

export const applyTemplatesResponseForServiceRuntime = {
  status: 'SUCCESS',
  data: {
    mergedPipelineYaml:
      'name: "testPipeline_Cypress"\nidentifier: "testPipeline_Cypress"\nallowStageExecutions: false\nprojectIdentifier: "Dummy_Pipeline"\norgIdentifier: "CVNG"\ntags: {}\nstages:\n- stage:\n    name: "testStage_Cypress"\n    identifier: "testStage_Cypress"\n    description: ""\n    type: "Deployment"\n    spec:\n      serviceConfig:\n        serviceRef: "<+input>"\n        serviceDefinition:\n          type: "Kubernetes"\n          spec:\n            variables: []\n      infrastructure:\n        environmentRef: "prod"\n        infrastructureDefinition:\n          type: "KubernetesDirect"\n          spec:\n            connectorRef: "testk8s"\n            namespace: "testStage_Cypress"\n            releaseName: "release-<+INFRA_KEY>"\n        allowSimultaneousDeployments: false\n      execution:\n        steps:\n        - step:\n            name: "Rollout Deployment"\n            identifier: "rolloutDeployment"\n            type: "K8sRollingDeploy"\n            timeout: "10m"\n            spec:\n              skipDryRun: false\n        - step:\n            type: "Verify"\n            name: "testStage_Cypress"\n            identifier: "testStage_Cypress"\n            spec:\n              type: "Rolling"\n              spec:\n                sensitivity: "HIGH"\n                duration: "5m"\n                deploymentTag: "<+serviceConfig.artifacts.primary.tag>"\n            timeout: "2h"\n            failureStrategies:\n            - onFailure:\n                errors:\n                - "Verification"\n                action:\n                  type: "ManualIntervention"\n                  spec:\n                    timeout: "2h"\n                    onTimeout:\n                      action:\n                        type: "StageRollback"\n            - onFailure:\n                errors:\n                - "Unknown"\n                action:\n                  type: "ManualIntervention"\n                  spec:\n                    timeout: "2h"\n                    onTimeout:\n                      action:\n                        type: "Ignore"\n        rollbackSteps:\n        - step:\n            name: "Rollback Rollout Deployment"\n            identifier: "rollbackRolloutDeployment"\n            type: "K8sRollingRollback"\n            timeout: "10m"\n            spec: {}\n    tags: {}\n    failureStrategies:\n    - onFailure:\n        errors:\n        - "AllErrors"\n        action:\n          type: "StageRollback"\n',
    templateReferenceSummaries: []
  },
  metaData: null,
  correlationId: '18de0752-2b9c-4a97-8229-b8e8d229f3b9'
}

export const pipelineSaveResponse = {
  status: 'SUCCESS',
  data: {
    yamlPipeline:
      'pipeline:\n    name: testPipeline_Cypress\n    identifier: testPipeline_Cypress\n    allowStageExecutions: false\n    projectIdentifier: project1\n    orgIdentifier: CVNG\n    tags: {}\n    stages:\n        - stage:\n              name: testStage_Cypress\n              identifier: testStage_Cypress\n              description: ""\n              type: Deployment\n              spec:\n                  serviceConfig:\n                      serviceRef: <+input>\n                      serviceDefinition:\n                          type: Kubernetes\n                          spec:\n                              variables: []\n                  infrastructure:\n                      environmentRef: prod\n                      infrastructureDefinition:\n                          type: KubernetesDirect\n                          spec:\n                              connectorRef: testk8s\n                              namespace: testStage_Cypress\n                              releaseName: release-<+INFRA_KEY>\n                      allowSimultaneousDeployments: false\n                  execution:\n                      steps:\n                          - step:\n                                name: Rollout Deployment\n                                identifier: rolloutDeployment\n                                type: K8sRollingDeploy\n                                timeout: 10m\n                                spec:\n                                    skipDryRun: false\n                          - step:\n                                type: Verify\n                                name: testStage_Cypress\n                                identifier: testStage_Cypress\n                                spec:\n                                    type: Rolling\n                                    spec:\n                                        sensitivity: HIGH\n                                        duration: 5m\n                                        deploymentTag: <+serviceConfig.artifacts.primary.tag>\n                                timeout: 2h\n                                failureStrategies:\n                                    - onFailure:\n                                          errors:\n                                              - Verification\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: StageRollback\n                                    - onFailure:\n                                          errors:\n                                              - Unknown\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: Ignore\n                      rollbackSteps:\n                          - step:\n                                name: Rollback Rollout Deployment\n                                identifier: rollbackRolloutDeployment\n                                type: K8sRollingRollback\n                                timeout: 10m\n                                spec: {}\n              tags: {}\n              failureStrategies:\n                  - onFailure:\n                        errors:\n                            - AllErrors\n                        action:\n                            type: StageRollback\n',
    version: 3,
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null },
    modules: ['cd']
  },
  metaData: null,
  correlationId: 'd0779a1a-ddcf-4ef0-a83f-fec0e894c180'
}

export const pipelineSaveServiceRuntimeResponse = {
  status: 'SUCCESS',
  data: {
    yamlPipeline:
      'pipeline:\n    name: testPipeline_Cypress\n    identifier: testPipeline_Cypress\n    allowStageExecutions: false\n    stages:\n        - stage:\n              name: testStage_Cypress\n              identifier: testStage_Cypress\n              description: ""\n              type: Deployment\n              spec:\n                  serviceConfig:\n                      serviceRef: <+input>\n                      serviceDefinition:\n                          type: Kubernetes\n                          spec:\n                              variables: []\n                  infrastructure:\n                      environmentRef: prod\n                      infrastructureDefinition:\n                          type: KubernetesDirect\n                          spec:\n                              connectorRef: account.ccm744xxng\n                              namespace: verify-step\n                              releaseName: release-<+INFRA_KEY>\n                      allowSimultaneousDeployments: false\n                  execution:\n                      steps:\n                          - step:\n                                name: Rollout Deployment\n                                identifier: rolloutDeployment\n                                type: K8sRollingDeploy\n                                timeout: 10m\n                                spec:\n                                    skipDryRun: false\n                          - step:\n                                type: Verify\n                                name: test-verify\n                                identifier: testverify\n                                spec:\n                                    type: Rolling\n                                    spec:\n                                        sensitivity: HIGH\n                                        duration: 5m\n                                        deploymentTag: <+serviceConfig.artifacts.primary.tag>\n                                timeout: 2h\n                                failureStrategies:\n                                    - onFailure:\n                                          errors:\n                                              - Verification\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: StageRollback\n                                    - onFailure:\n                                          errors:\n                                              - Unknown\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: Ignore\n                      rollbackSteps:\n                          - step:\n                                name: Rollback Rollout Deployment\n                                identifier: rollbackRolloutDeployment\n                                type: K8sRollingRollback\n                                timeout: 10m\n                                spec: {}\n              tags: {}\n              failureStrategies:\n                  - onFailure:\n                        errors:\n                            - AllErrors\n                        action:\n                            type: StageRollback\n    projectIdentifier: test_Projectddd\n    orgIdentifier: aa2ndOrgSunny\n    tags: {}\n',
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null },
    modules: ['cd']
  },
  metaData: null,
  correlationId: '604df445-22b0-4bb2-a560-f72b06342156'
}

export const inputSetsTemplateResponse = {
  status: 'SUCCESS',
  data: {
    inputSetTemplateYaml:
      'pipeline:\n  identifier: "testPipeline_Cypress"\n  stages:\n  - stage:\n      identifier: "testStage_Cypress"\n      type: "Deployment"\n      spec:\n        serviceConfig:\n          serviceRef: "<+input>"\n',
    modules: ['cd']
  },
  metaData: null,
  correlationId: '4c2742f8-7354-4627-896f-445a144eadc6'
}

export const inputSetsTemplateResponse2 = {
  status: 'SUCCESS',
  data: {
    inputSetTemplateYaml:
      'pipeline:\n  identifier: "test2"\n  stages:\n  - stage:\n      identifier: "testStage_Cypress"\n      type: "Deployment"\n      spec:\n        serviceConfig:\n          serviceRef: "<+input>"\n',
    modules: ['cd'],
    hasInputSets: false
  },
  metaData: null,
  correlationId: '3008ef61-8f0b-4a4f-8b7b-64897d4ba9d0'
}

export const pipelineDetailsWithRoutingIDResponse = {
  status: 'SUCCESS',
  data: {
    yamlPipeline:
      'pipeline:\n    name: testPipeline_Cypress\n    identifier: testPipeline_Cypress\n    allowStageExecutions: false\n    projectIdentifier: Dummy_Pipeline\n    orgIdentifier: CVNG\n    tags: {}\n    stages:\n        - stage:\n              name: testStage_Cypress\n              identifier: testStage_Cypress\n              description: ""\n              type: Deployment\n              spec:\n                  serviceConfig:\n                      serviceRef: <+input>\n                      serviceDefinition:\n                          type: Kubernetes\n                          spec:\n                              variables: []\n                  infrastructure:\n                      environmentRef: prod\n                      infrastructureDefinition:\n                          type: KubernetesDirect\n                          spec:\n                              connectorRef: testk8s\n                              namespace: testStage_Cypress\n                              releaseName: release-<+INFRA_KEY>\n                      allowSimultaneousDeployments: false\n                  execution:\n                      steps:\n                          - step:\n                                name: Rollout Deployment\n                                identifier: rolloutDeployment\n                                type: K8sRollingDeploy\n                                timeout: 10m\n                                spec:\n                                    skipDryRun: false\n                          - step:\n                                type: Verify\n                                name: testStage_Cypress\n                                identifier: testStage_Cypress\n                                spec:\n                                    type: Rolling\n                                    spec:\n                                        sensitivity: HIGH\n                                        duration: 5m\n                                        deploymentTag: <+serviceConfig.artifacts.primary.tag>\n                                timeout: 2h\n                                failureStrategies:\n                                    - onFailure:\n                                          errors:\n                                              - Verification\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: StageRollback\n                                    - onFailure:\n                                          errors:\n                                              - Unknown\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: Ignore\n                      rollbackSteps:\n                          - step:\n                                name: Rollback Rollout Deployment\n                                identifier: rollbackRolloutDeployment\n                                type: K8sRollingRollback\n                                timeout: 10m\n                                spec: {}\n              tags: {}\n              failureStrategies:\n                  - onFailure:\n                        errors:\n                            - AllErrors\n                        action:\n                            type: StageRollback\n',
    version: 3,
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null },
    modules: ['cd']
  },
  metaData: null,
  correlationId: 'd580f15a-c831-439b-82e0-dda58ce0b40f'
}

export const pipelineSummaryResponse = {
  status: 'SUCCESS',
  data: {
    name: 'testPipeline_Cypress',
    identifier: 'testPipeline_Cypress',
    tags: {},
    version: 3,
    numOfStages: 1,
    createdAt: 1645768746144,
    lastUpdatedAt: 1645781212062,
    modules: ['cd'],
    executionSummaryInfo: { numOfErrors: [], deployments: [] },
    filters: {
      cd: {
        deploymentTypes: ['Kubernetes'],
        environmentNames: ['prod'],
        serviceNames: [],
        infrastructureTypes: ['KubernetesDirect']
      }
    },
    stageNames: ['test2'],
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null }
  },
  metaData: null,
  correlationId: 'b306db34-72a0-4bfc-8fb1-2c18b2021b2a'
}

export const servicesV2AccessResponse = {
  status: 'SUCCESS',
  data: [
    {
      service: {
        accountId: 'zEaak-FLS425IEO7OLzMUg',
        identifier: 'testService',
        orgIdentifier: 'CVNG',
        projectIdentifier: 'Dummy_Pipeline',
        name: 'testService',
        description: null,
        deleted: false,
        tags: {},
        version: 18
      },
      createdAt: 1643080660753,
      lastModifiedAt: 1645703389065
    },
    {
      service: {
        accountId: 'zEaak-FLS425IEO7OLzMUg',
        identifier: 'testService2',
        orgIdentifier: 'CVNG',
        projectIdentifier: 'Dummy_Pipeline',
        name: 'testService2',
        description: null,
        deleted: false,
        tags: {},
        version: 18
      },
      createdAt: 1643080660753,
      lastModifiedAt: 1645703389065
    },
    {
      service: {
        accountId: 'zEaak-FLS425IEO7OLzMUg',
        identifier: 'testService3',
        orgIdentifier: 'CVNG',
        projectIdentifier: 'Dummy_Pipeline',
        name: 'testService3',
        description: null,
        deleted: false,
        tags: {},
        version: 18
      },
      createdAt: 1643080660753,
      lastModifiedAt: 1645703389065
    }
  ],
  metaData: null,
  correlationId: 'dbfcc921-47f3-4841-b67a-7a4f85b7d5f3'
}

export const inputSetTemplateRuntimeServiceResponse = {
  status: 'SUCCESS',
  data: {
    inputSetTemplateYaml:
      '---\npipeline:\n  identifier: "testPipeline_Cypress"\n  stages:\n  - stage:\n      identifier: "testStage_Cypress"\n      type: "Deployment"\n      spec:\n        serviceConfig:\n          serviceRef: "<+input>"\n        execution:\n          steps:\n          - step:\n              identifier: "testverify"\n              type: "Verify"\n'
  },
  metaData: null,
  correlationId: 'c4d605ed-f80d-485e-a4eb-9bac5e0f4551'
}

export const logsListCallResponse = {
  metaData: {},
  resource: {
    totalClusters: 29,
    eventCounts: [
      { clusterType: 'KNOWN_EVENT', count: 24, displayName: 'Known' },
      { clusterType: 'UNKNOWN_EVENT', count: 4, displayName: 'Unknown' },
      { clusterType: 'UNEXPECTED_FREQUENCY', count: 1, displayName: 'Unexpected Frequency' }
    ],
    logAnalysisRadarCharts: {
      totalPages: 3,
      totalItems: 29,
      pageItemCount: 10,
      pageSize: 10,
      content: [
        {
          message: 'Test Message',
          label: 0,
          risk: 'UNHEALTHY',
          clusterType: 'UNEXPECTED_FREQUENCY',
          count: 258,
          frequencyData: [45.0, 74.0, 44.0, 43.0, 52.0],
          baseline: {
            message: '< Transfer-Encoding: chunked\r\n',
            label: 0,
            risk: 'NO_ANALYSIS',
            clusterType: 'BASELINE',
            count: 0,
            frequencyData: [2.0],
            baseline: null,
            hasControlData: false
          },
          hasControlData: true,
          cluterId: 1
        },
        {
          message:
            '2022-02-10 07:22:59 UTC | TRACE | INFO | (pkg/trace/info/stats.go:104 in LogStats) | No data received\n',
          label: 30003,
          risk: 'UNHEALTHY',
          clusterType: 'UNKNOWN_EVENT',
          count: 1,
          frequencyData: [1.0],
          baseline: null,
          hasControlData: false,
          cluterId: 2
        },
        {
          message:
            '  A v e r a g e   S p e e d       T i m  e         T i m e        D lToiamde    UCpuload   Trorteanlt \n',
          label: 30001,
          risk: 'UNHEALTHY',
          clusterType: 'UNKNOWN_EVENT',
          count: 1,
          frequencyData: [1.0],
          baseline: null,
          hasControlData: false,
          cluterId: 3
        },
        {
          message:
            '  % Total    % Received % Xferd  Average Spee d   %  TTimoet a  l  T i m e%   R e c eTiivmeed   %C uXrfreerndt \n',
          label: 30002,
          risk: 'UNHEALTHY',
          clusterType: 'UNKNOWN_EVENT',
          count: 1,
          frequencyData: [1.0],
          baseline: null,
          hasControlData: false,
          cluterId: 4
        },
        {
          message:
            '    \r     0          D0l o a d   Up0l o a d    0  T   o0 t a l    S p0e n t     L   e0f t       0S p-e-e:d-\n',
          label: 30000,
          risk: 'UNHEALTHY',
          clusterType: 'UNKNOWN_EVENT',
          count: 1,
          frequencyData: [1.0],
          baseline: null,
          hasControlData: false,
          cluterId: 5
        },
        {
          message: '{ [2938 bytes data]\n',
          label: 11,
          risk: 'HEALTHY',
          clusterType: 'KNOWN_EVENT',
          count: 21,
          frequencyData: [3.0, 6.0, 4.0, 4.0, 4.0],
          baseline: {
            message: '{ [2938 bytes data]\n',
            label: 11,
            risk: 'NO_ANALYSIS',
            clusterType: 'BASELINE',
            count: 0,
            frequencyData: [38.0],
            baseline: null,
            hasControlData: false
          },
          hasControlData: true,
          cluterId: 6
        },
        {
          message:
            '</pre><p><b>Note</b> The full stack trace of the root cause is available in the server logs.</p><hr class="line" /><h3>Apache Tomcat/8.5.41</h3></body></html><!doctype html><html lang="en"><head><title>HTTP Status 500 – Internal Server Error</title><style type="text/css">h1 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:22px;} h2 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:16px;} h3 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:14px;} body {font-family:Tahoma,Arial,sans-serif;color:black;background-color:white;} b {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;} p {font-family:Tahoma,Arial,sans-serif;background:white;color:black;font-size:12px;} a {color:black;} a.name {color:black;} .line {height:1px;background-color:#525D76;border:none;}</style></head><body><h1>HTTP Status 500 – Internal Server Error</h1><hr class="line" /><p><b>Type</b> Exception Report</p><p><b>Description</b> The server encountered an unexpected condition that prevented it from fulfilling the request.</p><p><b>Exception</b></p><pre>java.lang.NullPointerException\n',
          label: 98,
          risk: 'HEALTHY',
          clusterType: 'KNOWN_EVENT',
          count: 4,
          frequencyData: [1.0, 1.0, 1.0, 1.0],
          baseline: {
            message:
              '</pre><p><b>Note</b> The full stack trace of the root cause is available in the server logs.</p><hr class="line" /><h3>Apache Tomcat/8.5.41</h3></body></html><!doctype html><html lang="en"><head><title>HTTP Status 500 – Internal Server Error</title><style type="text/css">h1 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:22px;} h2 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:16px;} h3 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:14px;} body {font-family:Tahoma,Arial,sans-serif;color:black;background-color:white;} b {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;} p {font-family:Tahoma,Arial,sans-serif;background:white;color:black;font-size:12px;} a {color:black;} a.name {color:black;} .line {height:1px;background-color:#525D76;border:none;}</style></head><body><h1>HTTP Status 500 – Internal Server Error</h1><hr class="line" /><p><b>Type</b> Exception Report</p><p><b>Description</b> The server encountered an unexpected condition that prevented it from fulfilling the request.</p><p><b>Exception</b></p><pre>java.lang.NullPointerException\n',
            label: 98,
            risk: 'NO_ANALYSIS',
            clusterType: 'BASELINE',
            count: 0,
            frequencyData: [8.0],
            baseline: null,
            hasControlData: false
          },
          hasControlData: true,
          cluterId: 7
        },
        {
          message: '< Location: display.jsp\r\n',
          label: 112,
          risk: 'HEALTHY',
          clusterType: 'KNOWN_EVENT',
          count: 3,
          frequencyData: [1.0, 1.0, 1.0],
          baseline: {
            message: '< Location: display.jsp\r\n',
            label: 112,
            risk: 'NO_ANALYSIS',
            clusterType: 'BASELINE',
            count: 0,
            frequencyData: [4.0],
            baseline: null,
            hasControlData: false
          },
          hasControlData: true,
          cluterId: 8
        },
        {
          message: '< Date: Thu, 10 Feb 2022 07:22:58 GMT\r\n',
          label: 80,
          risk: 'HEALTHY',
          clusterType: 'KNOWN_EVENT',
          count: 25,
          frequencyData: [5.0, 7.0, 4.0, 4.0, 5.0],
          baseline: {
            message: '< Date: Thu, 10 Feb 2022 07:22:58 GMT\r\n',
            label: 80,
            risk: 'NO_ANALYSIS',
            clusterType: 'BASELINE',
            count: 0,
            frequencyData: [41.0],
            baseline: null,
            hasControlData: false
          },
          hasControlData: true,
          cluterId: 9
        },
        {
          message: '* upload completely sent off: 47 out of 47 bytes\n',
          label: 89,
          risk: 'HEALTHY',
          clusterType: 'KNOWN_EVENT',
          count: 10,
          frequencyData: [2.0, 3.0, 2.0, 2.0, 1.0],
          baseline: {
            message: '* upload completely sent off: 47 out of 47 bytes\n',
            label: 89,
            risk: 'NO_ANALYSIS',
            clusterType: 'BASELINE',
            count: 0,
            frequencyData: [16.0],
            baseline: null,
            hasControlData: false
          },
          hasControlData: true,
          cluterId: 10
        }
      ],
      pageIndex: 0,
      empty: false
    }
  },
  responseMessages: []
}

export const logsRadarChartDataCallResponse = {
  metaData: {},
  resource: [
    {
      label: 0,
      message: 'Test Message',
      risk: 'UNHEALTHY',
      radius: 1.664038103272266,
      angle: 0.0,
      baseline: {
        label: 0,
        message: '< Transfer-Encoding: chunked\r\n',
        risk: 'NO_ANALYSIS',
        radius: 0.7284758929526032,
        angle: 0.0,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'UNEXPECTED_FREQUENCY',
      hasControlData: true,
      cluterId: 1
    },
    {
      label: 30003,
      message:
        '2022-02-10 07:22:59 UTC | TRACE | INFO | (pkg/trace/info/stats.go:104 in LogStats) | No data received\n',
      risk: 'UNHEALTHY',
      radius: 2.390506479391404,
      angle: 12.413793103448276,
      baseline: null,
      clusterType: 'UNKNOWN_EVENT',
      hasControlData: false
    },
    {
      label: 30001,
      message:
        '  A v e r a g e   S p e e d       T i m  e         T i m e        D lToiamde    UCpuload   Trorteanlt \n',
      risk: 'UNHEALTHY',
      radius: 2.893341160200387,
      angle: 24.82758620689655,
      baseline: null,
      clusterType: 'UNKNOWN_EVENT',
      hasControlData: false,
      cluterId: 2
    },
    {
      label: 30002,
      message:
        '  % Total    % Received % Xferd  Average Spee d   %  TTimoet a  l  T i m e%   R e c eTiivmeed   %C uXrfreerndt \n',
      risk: 'UNHEALTHY',
      radius: 2.749641708001546,
      angle: 37.241379310344826,
      baseline: null,
      clusterType: 'UNKNOWN_EVENT',
      hasControlData: false
    },
    {
      label: 30000,
      message:
        '    \r     0          D0l o a d   Up0l o a d    0  T   o0 t a l    S p0e n t     L   e0f t       0S p-e-e:d-\n',
      risk: 'UNHEALTHY',
      radius: 2.3594828023066827,
      angle: 49.6551724137931,
      baseline: null,
      clusterType: 'UNKNOWN_EVENT',
      hasControlData: false,
      cluterId: 3
    },
    {
      label: 11,
      message: '{ [2938 bytes data]\n',
      risk: 'HEALTHY',
      radius: 1.4753724935052714,
      angle: 62.06896551724138,
      baseline: {
        label: 11,
        message: '{ [2938 bytes data]\n',
        risk: 'NO_ANALYSIS',
        radius: 0.7435991129150041,
        angle: 62.06896551724138,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true,
      cluterId: 4
    },
    {
      label: 98,
      message:
        '</pre><p><b>Note</b> The full stack trace of the root cause is available in the server logs.</p><hr class="line" /><h3>Apache Tomcat/8.5.41</h3></body></html><!doctype html><html lang="en"><head><title>HTTP Status 500 – Internal Server Error</title><style type="text/css">h1 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:22px;} h2 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:16px;} h3 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:14px;} body {font-family:Tahoma,Arial,sans-serif;color:black;background-color:white;} b {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;} p {font-family:Tahoma,Arial,sans-serif;background:white;color:black;font-size:12px;} a {color:black;} a.name {color:black;} .line {height:1px;background-color:#525D76;border:none;}</style></head><body><h1>HTTP Status 500 – Internal Server Error</h1><hr class="line" /><p><b>Type</b> Exception Report</p><p><b>Description</b> The server encountered an unexpected condition that prevented it from fulfilling the request.</p><p><b>Exception</b></p><pre>java.lang.NullPointerException\n',
      risk: 'HEALTHY',
      radius: 1.114701392021402,
      angle: 74.48275862068965,
      baseline: {
        label: 98,
        message:
          '</pre><p><b>Note</b> The full stack trace of the root cause is available in the server logs.</p><hr class="line" /><h3>Apache Tomcat/8.5.41</h3></body></html><!doctype html><html lang="en"><head><title>HTTP Status 500 – Internal Server Error</title><style type="text/css">h1 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:22px;} h2 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:16px;} h3 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:14px;} body {font-family:Tahoma,Arial,sans-serif;color:black;background-color:white;} b {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;} p {font-family:Tahoma,Arial,sans-serif;background:white;color:black;font-size:12px;} a {color:black;} a.name {color:black;} .line {height:1px;background-color:#525D76;border:none;}</style></head><body><h1>HTTP Status 500 – Internal Server Error</h1><hr class="line" /><p><b>Type</b> Exception Report</p><p><b>Description</b> The server encountered an unexpected condition that prevented it from fulfilling the request.</p><p><b>Exception</b></p><pre>java.lang.NullPointerException\n',
        risk: 'NO_ANALYSIS',
        radius: 0.624414806316096,
        angle: 74.48275862068965,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true,
      cluterId: 5
    },
    {
      label: 112,
      message: '< Location: display.jsp\r\n',
      risk: 'HEALTHY',
      radius: 1.2743624821383874,
      angle: 86.89655172413792,
      baseline: {
        label: 112,
        message: '< Location: display.jsp\r\n',
        risk: 'NO_ANALYSIS',
        radius: 0.7819754958788627,
        angle: 86.89655172413792,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true,
      cluterId: 6
    },
    {
      label: 80,
      message: '< Date: Thu, 10 Feb 2022 07:22:58 GMT\r\n',
      risk: 'HEALTHY',
      radius: 1.191633119402034,
      angle: 99.31034482758619,
      baseline: {
        label: 80,
        message: '< Date: Thu, 10 Feb 2022 07:22:58 GMT\r\n',
        risk: 'NO_ANALYSIS',
        radius: 0.747427073093925,
        angle: 99.31034482758619,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true,
      cluterId: 7
    },
    {
      label: 89,
      message: '* upload completely sent off: 47 out of 47 bytes\n',
      risk: 'HEALTHY',
      radius: 1.858619157500502,
      angle: 111.72413793103446,
      baseline: {
        label: 89,
        message: '* upload completely sent off: 47 out of 47 bytes\n',
        risk: 'NO_ANALYSIS',
        radius: 0.8340526408266267,
        angle: 111.72413793103446,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true,
      cluterId: 8
    },
    {
      label: 92,
      message: '* TCP_NODELAY set\n',
      risk: 'HEALTHY',
      radius: 1.593751154844217,
      angle: 124.13793103448273,
      baseline: {
        label: 92,
        message: '* TCP_NODELAY set\n',
        risk: 'NO_ANALYSIS',
        radius: 0.6157422250847977,
        angle: 124.13793103448273,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true,
      cluterId: 9
    },
    {
      label: 5,
      message: '* Re-using existing connection! (#0) with host localhost\n',
      risk: 'HEALTHY',
      radius: 1.8772513437726532,
      angle: 136.55172413793102,
      baseline: {
        label: 5,
        message: '* Re-using existing connection! (#0) with host localhost\n',
        risk: 'NO_ANALYSIS',
        radius: 0.7562558045246719,
        angle: 136.55172413793102,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true,
      cluterId: 10
    }
  ],
  responseMessages: []
}

export const inputSetTemplateNoInput = {
  status: 'SUCCESS',
  data: { modules: ['cd'], hasInputSets: false },
  metaData: null,
  correlationId: '386785c4-4313-4ee5-b4cf-d6a269e3befb'
}

export const templateResolvedPipelineResponse = {
  status: 'SUCCESS',
  data: {
    yamlPipeline:
      'pipeline:\n    name: test2\n    identifier: test2\n    allowStageExecutions: false\n    stages:\n        - stage:\n              name: testStage_Cypress\n              identifier: testStage_Cypress\n              description: ""\n              type: Deployment\n              spec:\n                  serviceConfig:\n                      serviceRef: eeeee\n                      serviceDefinition:\n                          type: Kubernetes\n                          spec:\n                              variables: []\n                  infrastructure:\n                      environmentRef: prod\n                      infrastructureDefinition:\n                          type: KubernetesDirect\n                          spec:\n                              connectorRef: account.ccm744xxng\n                              namespace: nss\n                              releaseName: release-<+INFRA_KEY>\n                      allowSimultaneousDeployments: false\n                  execution:\n                      steps:\n                          - step:\n                                name: Rollout Deployment\n                                identifier: rolloutDeployment\n                                type: K8sRollingDeploy\n                                timeout: 10m\n                                spec:\n                                    skipDryRun: false\n                          - step:\n                                type: Verify\n                                name: test\n                                identifier: test\n                                spec:\n                                    type: Rolling\n                                    spec:\n                                        sensitivity: HIGH\n                                        duration: 5m\n                                        deploymentTag: <+serviceConfig.artifacts.primary.tag>\n                                timeout: 2h\n                                failureStrategies:\n                                    - onFailure:\n                                          errors:\n                                              - Verification\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: StageRollback\n                                    - onFailure:\n                                          errors:\n                                              - Unknown\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: Ignore\n                      rollbackSteps:\n                          - step:\n                                name: Rollback Rollout Deployment\n                                identifier: rollbackRolloutDeployment\n                                type: K8sRollingRollback\n                                timeout: 10m\n                                spec: {}\n              tags: {}\n              failureStrategies:\n                  - onFailure:\n                        errors:\n                            - AllErrors\n                        action:\n                            type: StageRollback\n    projectIdentifier: test_Projectddd\n    orgIdentifier: aa2ndOrgSunny\n    tags: {}\n',
    resolvedTemplatesPipelineYaml:
      'pipeline:\n  name: "test2"\n  identifier: "test2"\n  allowStageExecutions: false\n  stages:\n  - stage:\n      name: "testStage_Cypress"\n      identifier: "testStage_Cypress"\n      description: ""\n      type: "Deployment"\n      spec:\n        serviceConfig:\n          serviceRef: "eeeee"\n          serviceDefinition:\n            type: "Kubernetes"\n            spec:\n              variables: []\n        infrastructure:\n          environmentRef: "prod"\n          infrastructureDefinition:\n            type: "KubernetesDirect"\n            spec:\n              connectorRef: "account.ccm744xxng"\n              namespace: "nss"\n              releaseName: "release-<+INFRA_KEY>"\n          allowSimultaneousDeployments: false\n        execution:\n          steps:\n          - step:\n              name: "Rollout Deployment"\n              identifier: "rolloutDeployment"\n              type: "K8sRollingDeploy"\n              timeout: "10m"\n              spec:\n                skipDryRun: false\n          - step:\n              type: "Verify"\n              name: "test"\n              identifier: "test"\n              spec:\n                type: "Rolling"\n                spec:\n                  sensitivity: "HIGH"\n                  duration: "5m"\n                  deploymentTag: "<+serviceConfig.artifacts.primary.tag>"\n              timeout: "2h"\n              failureStrategies:\n              - onFailure:\n                  errors:\n                  - "Verification"\n                  action:\n                    type: "ManualIntervention"\n                    spec:\n                      timeout: "2h"\n                      onTimeout:\n                        action:\n                          type: "StageRollback"\n              - onFailure:\n                  errors:\n                  - "Unknown"\n                  action:\n                    type: "ManualIntervention"\n                    spec:\n                      timeout: "2h"\n                      onTimeout:\n                        action:\n                          type: "Ignore"\n          rollbackSteps:\n          - step:\n              name: "Rollback Rollout Deployment"\n              identifier: "rollbackRolloutDeployment"\n              type: "K8sRollingRollback"\n              timeout: "10m"\n              spec: {}\n      tags: {}\n      failureStrategies:\n      - onFailure:\n          errors:\n          - "AllErrors"\n          action:\n            type: "StageRollback"\n  projectIdentifier: "test_Projectddd"\n  orgIdentifier: "aa2ndOrgSunny"\n  tags: {}\n',
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null },
    modules: ['cd']
  },
  metaData: null,
  correlationId: 'b113202a-508a-458e-a9e1-a42d5849558d'
}

export const strategiesYAMLResponse = {
  status: 'SUCCESS',
  data: 'failureStrategies:\n  - onFailure:\n      errors:\n        - AllErrors\n      action:\n        type: StageRollback\nspec:\n  execution:\n    steps:\n      - step:\n          name: "Rollout Deployment"\n          identifier: rolloutDeployment\n          type: K8sRollingDeploy\n          timeout: 10m\n          spec:\n            skipDryRun: false\n    rollbackSteps:\n      - step:\n          name: "Rollback Rollout Deployment"\n          identifier: rollbackRolloutDeployment\n          type: K8sRollingRollback\n          timeout: 10m\n          spec: {}\n',
  metaData: null,
  correlationId: '4cc32df2-42f5-45a3-977f-500c1c9c9a2d'
}

export const savePipelineGetResponse = {
  status: 'SUCCESS',
  data: {
    yamlPipeline:
      'pipeline:\n    name: testPipeline_Cypress\n    identifier: testPipeline_Cypress\n    allowStageExecutions: false\n    stages:\n        - stage:\n              name: testStage_Cypress\n              identifier: testStage_Cypress\n              description: ""\n              type: Deployment\n              spec:\n                  serviceConfig:\n                      serviceRef: <+input>\n                      serviceDefinition:\n                          type: Kubernetes\n                          spec:\n                              variables: []\n                  infrastructure:\n                      environmentRef: prod\n                      infrastructureDefinition:\n                          type: KubernetesDirect\n                          spec:\n                              connectorRef: account.ccm744xxng\n                              namespace: ns\n                              releaseName: release-<+INFRA_KEY>\n                      allowSimultaneousDeployments: false\n                  execution:\n                      steps:\n                          - step:\n                                name: Rollout Deployment\n                                identifier: rolloutDeployment\n                                type: K8sRollingDeploy\n                                timeout: 10m\n                                spec:\n                                    skipDryRun: false\n                          - step:\n                                type: Verify\n                                name: test-verify\n                                identifier: testverify\n                                spec:\n                                    type: Rolling\n                                    spec:\n                                        sensitivity: HIGH\n                                        duration: 5m\n                                        deploymentTag: <+serviceConfig.artifacts.primary.tag>\n                                timeout: 2h\n                                failureStrategies:\n                                    - onFailure:\n                                          errors:\n                                              - Verification\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: StageRollback\n                                    - onFailure:\n                                          errors:\n                                              - Unknown\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: Ignore\n                      rollbackSteps:\n                          - step:\n                                name: Rollback Rollout Deployment\n                                identifier: rollbackRolloutDeployment\n                                type: K8sRollingRollback\n                                timeout: 10m\n                                spec: {}\n              tags: {}\n              failureStrategies:\n                  - onFailure:\n                        errors:\n                            - AllErrors\n                        action:\n                            type: StageRollback\n    projectIdentifier: test_Projectddd\n    orgIdentifier: aa2ndOrgSunny\n    tags: {}\n',
    resolvedTemplatesPipelineYaml:
      'pipeline:\n  name: "testPipeline_Cypress"\n  identifier: "testPipeline_Cypress"\n  allowStageExecutions: false\n  stages:\n  - stage:\n      name: "testStage_Cypress"\n      identifier: "testStage_Cypress"\n      description: ""\n      type: "Deployment"\n      spec:\n        serviceConfig:\n          serviceRef: "<+input>"\n          serviceDefinition:\n            type: "Kubernetes"\n            spec:\n              variables: []\n        infrastructure:\n          environmentRef: "prod"\n          infrastructureDefinition:\n            type: "KubernetesDirect"\n            spec:\n              connectorRef: "account.ccm744xxng"\n              namespace: "ns"\n              releaseName: "release-<+INFRA_KEY>"\n          allowSimultaneousDeployments: false\n        execution:\n          steps:\n          - step:\n              name: "Rollout Deployment"\n              identifier: "rolloutDeployment"\n              type: "K8sRollingDeploy"\n              timeout: "10m"\n              spec:\n                skipDryRun: false\n          - step:\n              type: "Verify"\n              name: "test-verify"\n              identifier: "testverify"\n              spec:\n                type: "Rolling"\n                spec:\n                  sensitivity: "HIGH"\n                  duration: "5m"\n                  deploymentTag: "<+serviceConfig.artifacts.primary.tag>"\n              timeout: "2h"\n              failureStrategies:\n              - onFailure:\n                  errors:\n                  - "Verification"\n                  action:\n                    type: "ManualIntervention"\n                    spec:\n                      timeout: "2h"\n                      onTimeout:\n                        action:\n                          type: "StageRollback"\n              - onFailure:\n                  errors:\n                  - "Unknown"\n                  action:\n                    type: "ManualIntervention"\n                    spec:\n                      timeout: "2h"\n                      onTimeout:\n                        action:\n                          type: "Ignore"\n          rollbackSteps:\n          - step:\n              name: "Rollback Rollout Deployment"\n              identifier: "rollbackRolloutDeployment"\n              type: "K8sRollingRollback"\n              timeout: "10m"\n              spec: {}\n      tags: {}\n      failureStrategies:\n      - onFailure:\n          errors:\n          - "AllErrors"\n          action:\n            type: "StageRollback"\n  projectIdentifier: "test_Projectddd"\n  orgIdentifier: "aa2ndOrgSunny"\n  tags: {}\n',
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null },
    modules: ['cd']
  },
  metaData: null,
  correlationId: '129fe201-d9fe-4145-8d63-997a004d4ab3'
}

export const inputSetsTemplateServiceRunTimeInputResponse = {
  status: 'SUCCESS',
  data: {
    inputSetTemplateYaml:
      'pipeline:\n  identifier: "testPipeline_Cypress"\n  stages:\n  - stage:\n      identifier: "testStage_Cypress"\n      type: "Deployment"\n      spec:\n        serviceConfig:\n          serviceRef: "<+input>"\n',
    modules: ['cd'],
    hasInputSets: false
  },
  metaData: null,
  correlationId: '9691f646-56a0-467e-bdc4-a66c6df6a59d'
}
