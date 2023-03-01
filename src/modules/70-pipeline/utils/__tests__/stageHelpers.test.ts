/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { MultiTypeInputType } from '@harness/uicore'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StageElementWrapperConfig } from 'services/pipeline-ng'
import type { DeploymentStageElementConfig } from '../pipelineTypes'
import {
  changeEmptyValuesToRunTimeInput,
  getHelpeTextForTags,
  isCIStage,
  isCDStage,
  isInfraDefinitionPresent,
  isServerlessDeploymentType,
  ServiceDeploymentType,
  getCustomStepProps,
  getStepTypeByDeploymentType,
  deleteStageData,
  hasCDStage,
  hasCIStage,
  hasServiceDetail,
  hasSTOStage,
  isSSHWinRMDeploymentType,
  isWinRmDeploymentType,
  isAzureWebAppDeploymentType,
  isElastigroupDeploymentType,
  hasOverviewDetail,
  isAzureWebAppGenericDeploymentType,
  isCustomDeploymentType,
  isEcsDeploymentType,
  isNativeHelmDeploymentType,
  isTASDeploymentType,
  RepositoryFormatTypes,
  isAzureWebAppOrSshWinrmGenericDeploymentType,
  isCustomDTGenericDeploymentType,
  isTasGenericDeploymentType,
  hasChainedPipelineStage,
  isFixedNonEmptyValue,
  withoutSideCar,
  hasStageData,
  getAllowedRepoOptions,
  deleteStageInfo,
  isServiceEntityPresent,
  isEnvironmentGroupPresent,
  isEnvironmentPresent,
  isExecutionFieldPresent
} from '../stageHelpers'
import inputSetPipeline from './inputset-pipeline.json'
import chainedPipeline from './mockJson/chainedPipeline.json'

test('if empty values are being replaced with <+input> except for tags', () => {
  const outputCriteria = changeEmptyValuesToRunTimeInput(inputSetPipeline, '')

  expect(
    (outputCriteria as any).pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary.spec
      .tag
  ).toBe('<+input>')
  expect(
    (outputCriteria as any).pipeline.stages[1].stage.spec.serviceConfig.serviceDefinition.spec.manifests[0].manifest
      .spec.store.spec.branch
  ).toBe('<+input>')
  expect((outputCriteria as any).tags.Test1).toBe('')
})

test('isCIStage', () => {
  expect(isCIStage({})).toBe(false)
  expect(isCIStage({ module: 'ci' })).toBe(true)
  expect(isCIStage({ moduleInfo: { ci: { test: {} } } })).toBe(true)
})

test('isCDStage', () => {
  expect(isCDStage({})).toBe(false)
  expect(isCDStage({ module: 'cd' })).toBe(true)
  expect(isCDStage({ moduleInfo: { cd: { test: {} } } })).toBe(true)
})

test('hasCDStage', () => {
  expect(hasCDStage({})).toBe(false)
  expect(
    hasCDStage({
      modules: ['cd']
    })
  ).toBe(true)
})

test('hasServiceDetail', () => {
  expect(hasServiceDetail({})).toBe(false)
  expect(
    hasServiceDetail({
      modules: ['cd', 'serviceDetail']
    })
  ).toBe(true)
})

test('hasOverviewDetail', () => {
  expect(hasOverviewDetail({})).toBe(false)
  expect(
    hasOverviewDetail({
      modules: ['cd', 'overviewPage']
    })
  ).toBe(true)
})

test('hasCIStage', () => {
  expect(hasCIStage({})).toBe(false)
  expect(
    hasCIStage({
      modules: ['ci', 'overviewPage']
    })
  ).toBe(true)
})

test('hasSTOStage', () => {
  expect(hasSTOStage({})).toBe(false)
  expect(
    hasSTOStage({
      modules: ['sto', 'ci']
    })
  ).toBe(true)
})

test('isInfraDefinitionPresent', () => {
  expect(isInfraDefinitionPresent({ identifier: 'test', name: 'testName' })).toBe(false)
  expect(
    isInfraDefinitionPresent({
      identifier: 'test',
      name: 'testName',
      spec: {
        serviceConfig: {},
        execution: { steps: [] },
        infrastructure: { infrastructureDefinition: { spec: {}, type: 'KubernetesAzure' } }
      }
    })
  ).toBe(true)
})

test('deleteStageInfo', () => {
  const deploymentConfig = {
    identifier: '1',
    name: 'test',
    spec: {
      service: {},
      environment: {},

      execution: {
        steps: [],
        rollbackSteps: [
          {
            name: 'step1'
          }
        ]
      },
      infrastructure: {
        allowSimultaneousDeployments: false,
        infrastructureDefinition: {
          type: 'Pdc',
          spec: {}
        }
      },
      serviceConfig: {
        serviceDefinition: {
          spec: {
            artifacts: ['test'],
            manifests: ['test']
          }
        }
      }
    }
  }
  deleteStageInfo(deploymentConfig as unknown as DeploymentStageElementConfig)
  expect(deleteStageData(undefined)).toBe(undefined)
  expect(deploymentConfig.spec?.execution?.rollbackSteps).toBeUndefined()
  expect(deploymentConfig.spec?.execution?.steps).toHaveLength(0)
  expect(deploymentConfig.spec?.service).toBeUndefined()
  expect(deploymentConfig.spec?.environment).toBeUndefined()
})
test('deleteStageData', () => {
  const deploymentConfig = {
    identifier: '1',
    name: 'test',
    spec: {
      execution: {
        steps: [],
        rollbackSteps: [
          {
            name: 'step1'
          }
        ]
      },
      infrastructure: {
        allowSimultaneousDeployments: false,
        infrastructureDefinition: {
          type: 'Pdc',
          spec: {}
        }
      },
      serviceConfig: {
        serviceDefinition: {
          spec: {
            artifacts: ['test'],
            manifests: ['test']
          }
        }
      }
    }
  }

  deleteStageData(deploymentConfig as unknown as DeploymentStageElementConfig)

  expect(deploymentConfig.spec?.execution?.rollbackSteps).toBeUndefined()
  expect(deploymentConfig.spec?.serviceConfig?.serviceDefinition?.spec.artifacts).toBeUndefined()
  expect(deploymentConfig.spec?.serviceConfig?.serviceDefinition?.spec.manifests).toBeUndefined()
  expect(deploymentConfig.spec?.infrastructure?.allowSimultaneousDeployments).toBeUndefined()
  expect(deploymentConfig.spec?.infrastructure?.infrastructureDefinition).toBeUndefined()
  expect(deploymentConfig.spec?.execution?.steps.length).toBe(0)

  expect(deleteStageData(undefined)).toBe(undefined)
})

test('getStepTypeByDeploymentType', () => {
  expect(getStepTypeByDeploymentType(ServiceDeploymentType.ServerlessAwsLambda)).toBe(StepType.ServerlessAwsLambda)
  expect(getStepTypeByDeploymentType(ServiceDeploymentType.Kubernetes)).toBe(StepType.K8sServiceSpec)
  expect(getStepTypeByDeploymentType(ServiceDeploymentType.Ssh)).toBe(StepType.SshServiceSpec)
  expect(getStepTypeByDeploymentType(ServiceDeploymentType.WinRm)).toBe(StepType.WinRmServiceSpec)
  expect(getStepTypeByDeploymentType(ServiceDeploymentType.ECS)).toBe(StepType.EcsService)
  expect(getStepTypeByDeploymentType(ServiceDeploymentType.CustomDeployment)).toBe(StepType.CustomDeploymentServiceSpec)
  expect(getStepTypeByDeploymentType(ServiceDeploymentType.Elastigroup)).toBe(StepType.ElastigroupService)
  expect(getStepTypeByDeploymentType(ServiceDeploymentType.TAS)).toBe(StepType.TasService)
  expect(getStepTypeByDeploymentType(ServiceDeploymentType.Asg)).toBe(StepType.Asg)
  expect(getStepTypeByDeploymentType(ServiceDeploymentType.GoogleCloudFunctions)).toBe(
    StepType.GoogleCloudFunctionsService
  )
  expect(getStepTypeByDeploymentType(ServiceDeploymentType.AzureWebApp)).toBe(StepType.AzureWebAppServiceSpec)
  expect(getStepTypeByDeploymentType('')).toBe(StepType.K8sServiceSpec)
  expect(getStepTypeByDeploymentType(ServiceDeploymentType.AwsLambda)).toBe(StepType.AwsLambdaService)
})

test('isServerlessDeploymentType', () => {
  expect(isServerlessDeploymentType(ServiceDeploymentType.ServerlessAwsLambda)).toBe(true)
  expect(isServerlessDeploymentType(ServiceDeploymentType.ServerlessAzureFunctions)).toBe(true)
  expect(isServerlessDeploymentType(ServiceDeploymentType.ServerlessGoogleFunctions)).toBe(true)
  expect(isServerlessDeploymentType(ServiceDeploymentType.AmazonSAM)).toBe(true)
  expect(isServerlessDeploymentType(ServiceDeploymentType.AzureFunctions)).toBe(true)
  expect(isServerlessDeploymentType(ServiceDeploymentType.Kubernetes)).toBe(false)
})

test('isSSHWinRMDeploymentType', () => {
  expect(isSSHWinRMDeploymentType(ServiceDeploymentType.WinRm)).toBe(true)
  expect(isSSHWinRMDeploymentType(ServiceDeploymentType.Ssh)).toBe(true)
  expect(isSSHWinRMDeploymentType(ServiceDeploymentType.AzureWebApp)).toBe(false)
})

test('isWinRmDeploymentType', () => {
  expect(isWinRmDeploymentType(ServiceDeploymentType.WinRm)).toBe(true)
  expect(isWinRmDeploymentType(ServiceDeploymentType.Ssh)).toBe(false)
  expect(isWinRmDeploymentType(ServiceDeploymentType.AzureWebApp)).toBe(false)
})

test('isAzureWebAppDeploymentType', () => {
  expect(isAzureWebAppDeploymentType(ServiceDeploymentType.WinRm)).toBe(false)
  expect(isAzureWebAppDeploymentType(ServiceDeploymentType.Ssh)).toBe(false)
  expect(isAzureWebAppDeploymentType(ServiceDeploymentType.AzureWebApp)).toBe(true)
})

test('isElastigroupDeploymentType', () => {
  expect(isElastigroupDeploymentType(ServiceDeploymentType.Elastigroup)).toBe(true)
  expect(isElastigroupDeploymentType(ServiceDeploymentType.WinRm)).toBe(false)
})

test('isCustomDeploymentType', () => {
  expect(isCustomDeploymentType(ServiceDeploymentType.CustomDeployment)).toBe(true)
  expect(isCustomDeploymentType(ServiceDeploymentType.WinRm)).toBe(false)
})
test('isNativeHelmDeploymentType', () => {
  expect(isNativeHelmDeploymentType(ServiceDeploymentType.NativeHelm)).toBe(true)
  expect(isNativeHelmDeploymentType(ServiceDeploymentType.WinRm)).toBe(false)
})
test('isEcsDeploymentType', () => {
  expect(isEcsDeploymentType(ServiceDeploymentType.ECS)).toBe(true)
  expect(isEcsDeploymentType(ServiceDeploymentType.WinRm)).toBe(false)
})
test('isAzureWebAppGenericDeploymentType', () => {
  expect(isAzureWebAppGenericDeploymentType(ServiceDeploymentType.Elastigroup, '')).toBe(false)
  expect(isAzureWebAppGenericDeploymentType(ServiceDeploymentType.AzureWebApp, RepositoryFormatTypes.Generic)).toBe(
    true
  )
})

test('isFixedNonEmptyValue', () => {
  expect(isFixedNonEmptyValue('<+input>')).toBe(false)
  expect(isFixedNonEmptyValue(MultiTypeInputType.FIXED)).toBe(true)
  expect(isFixedNonEmptyValue('123')).toBe(true)
  expect(isFixedNonEmptyValue('')).toBe(false)
})

test('getAllowedRepoOptions', () => {
  expect(getAllowedRepoOptions(ServiceDeploymentType.WinRm, true, true, 'Acr')).toHaveLength(4)

  expect(getAllowedRepoOptions(ServiceDeploymentType.AzureWebApp, true, true, 'Acr')).toHaveLength
})

test('isAzureWebAppOrSshWinrmGenericDeploymentType', () => {
  expect(
    isAzureWebAppOrSshWinrmGenericDeploymentType(ServiceDeploymentType.AzureWebApp, RepositoryFormatTypes.Generic)
  ).toBe(true)
})

test('withoutSideCar', () => {
  expect(withoutSideCar(ServiceDeploymentType.Ssh)).toBe(true)
})

test('isCustomDTGenericDeploymentType', () => {
  expect(isCustomDTGenericDeploymentType(ServiceDeploymentType.CustomDeployment, RepositoryFormatTypes.Generic)).toBe(
    true
  )
  expect(isCustomDTGenericDeploymentType(ServiceDeploymentType.WinRm, RepositoryFormatTypes.Generic)).toBe(false)
})

test('isTasGenericDeploymentType', () => {
  expect(isTasGenericDeploymentType(ServiceDeploymentType.TAS, RepositoryFormatTypes.Generic)).toBe(true)
})

test('isTasGenericDeploymentType should return false for nongeneric repo type', () => {
  expect(isTasGenericDeploymentType(ServiceDeploymentType.TAS, RepositoryFormatTypes.Docker)).toBe(false)
})

test('isTASDeploymentType', () => {
  expect(isTASDeploymentType(ServiceDeploymentType.TAS)).toBe(true)
  expect(isTASDeploymentType(ServiceDeploymentType.Elastigroup)).toBe(false)
})

test('getHelpeTextForTags', () => {
  expect(
    getHelpeTextForTags({ imagePath: '/image', artifactPath: '', connectorRef: 'RUNTIME' }, (str: string) => str, false)
  ).toBe('pipeline.artifactPathLabel  is  pipeline.tagDependencyRequired')

  expect(
    getHelpeTextForTags(
      { imagePath: '', artifactPath: '/artifact', connectorRef: 'RUNTIME' },
      (str: string) => str,
      false
    )
  ).toBe('pipeline.imagePathLabel  is  pipeline.tagDependencyRequired')

  expect(
    getHelpeTextForTags({ imagePath: '/image', artifactPath: '', connectorRef: 'RUNTIME' }, (str: string) => str, true)
  ).toBe('pipeline.artifactsSelection.artifactDirectory  is  pipeline.artifactPathDependencyRequired')

  expect(
    getHelpeTextForTags({ imagePath: '/image', artifactPath: '', connectorRef: 'RUNTIME' }, (str: string) => str, true)
  ).toBe('pipeline.artifactsSelection.artifactDirectory  is  pipeline.artifactPathDependencyRequired')

  expect(
    getHelpeTextForTags(
      {
        imagePath: '/image',
        artifactPath: '',
        connectorRef: 'sdfds',
        feed: 'test',
        repositoryName: '',
        artifactArrayPath: '',
        artifactDirectory: 'test-dir',
        versionPath: 'RUNTIME'
      },
      (str: string) => str,
      true
    )
  ).toBe(
    'common.repositoryName, pipeline.artifactsSelection.artifactsArrayPath  are  pipeline.artifactPathDependencyRequired'
  )

  // expect(
  //   getHelpeTextForTags(
  //     {
  //       imagePath: '/image',
  //       artifactPath: '',
  //       connectorRef: 'sdfds',
  //       feed: '',
  //       repositoryName: '',
  //       artifactArrayPath: '',
  //       versionPath: '',
  //       packageName: 'RUNTIME'
  //     },
  //     (str: string) => str,
  //     true
  //   )
  // ).toBe('pipeline.testsReports.callgraphField.package')

  // expect(
  //   getHelpeTextForTags(
  //     {
  //       imagePath: '/image',
  //       artifactPath: '',
  //       connectorRef: 'sdfds',
  //       feed: '',
  //       repositoryName: '',
  //       artifactArrayPath: '',
  //       versionPath: '',
  //       package: 'RUNTIME'
  //     },
  //     (str: string) => str,
  //     true
  //   )
  // ).toBe('pipeline.testsReports.callgraphField.package')

  // expect(
  //   getHelpeTextForTags(
  //     {
  //       imagePath: '/image',
  //       artifactPath: '',
  //       connectorRef: 'sdfds',
  //       feed: '',
  //       repositoryName: '',
  //       artifactArrayPath: '',
  //       versionPath: '',
  //       project: 'RUNTIME'
  //     },
  //     (str: string) => str,
  //     true
  //   )
  // ).toBe('projectLabel')

  // expect(
  //   getHelpeTextForTags(
  //     {
  //       imagePath: '/image',
  //       artifactPath: '',
  //       connectorRef: 'sdfds',
  //       feed: '',
  //       repositoryName: '',
  //       artifactArrayPath: '',
  //       versionPath: '',
  //       region: 'RUNTIME'
  //     },
  //     (str: string) => str,
  //     true
  //   )
  // ).toBe('regionLabel')

  // expect(
  //   getHelpeTextForTags(
  //     {
  //       imagePath: '/image',
  //       artifactPath: '',
  //       connectorRef: 'sdfds',
  //       feed: '',
  //       repositoryName: '',
  //       artifactArrayPath: '',
  //       versionPath: '',
  //       registryHostname: 'RUNTIME'
  //     },
  //     (str: string) => str,
  //     true
  //   )
  // ).toBe('connectors.GCR.registryHostname')
})

test('getCustomStepProps', () => {
  expect(getCustomStepProps(ServiceDeploymentType.ServerlessAwsLambda, (str: string) => str)).toStrictEqual({
    formInfo: {
      formName: 'serverlessAWSInfra',
      header: 'pipelineSteps.awsConnectorLabel',
      tooltipIds: {
        connector: 'awsInfraConnector',
        region: 'awsRegion',
        stage: 'awsStage'
      },
      type: 'Aws'
    },
    hasRegion: true
  })
  expect(getCustomStepProps(ServiceDeploymentType.ServerlessAzureFunctions, (str: string) => str)).toStrictEqual({
    formInfo: {
      formName: 'serverlessAzureInfra',
      header: 'pipelineSteps.awsConnectorLabel',
      tooltipIds: {
        connector: 'azureInfraConnector',
        region: 'azureRegion',
        stage: 'azureStage'
      },
      type: 'Gcp'
    }
  })
  expect(getCustomStepProps(ServiceDeploymentType.ServerlessGoogleFunctions, (str: string) => str)).toStrictEqual({
    formInfo: {
      formName: 'serverlessGCPInfra',
      header: 'pipelineSteps.gcpConnectorLabel',
      tooltipIds: {
        connector: 'gcpInfraConnector',
        region: 'gcpRegion',
        stage: 'gcpStage'
      },
      type: 'Gcp'
    }
  })
  expect(getCustomStepProps(ServiceDeploymentType.AmazonSAM, (str: string) => str)).toStrictEqual({
    formInfo: {}
  })
})

test('hasChainedPipelineStage', () => {
  expect(hasChainedPipelineStage([])).toBe(false)
  expect(hasChainedPipelineStage(chainedPipeline.pipeline.stages as StageElementWrapperConfig[])).toBe(true)
})

test('hasStageData', () => {
  expect(hasStageData()).toBe(false)
  expect(
    hasStageData({
      name: 'test',
      identifier: 'test',
      spec: {
        service: {
          serviceRef: 'test'
        },
        execution: { steps: [] }
      }
    })
  ).toBe(true)
  expect(
    hasStageData({
      name: 'test',
      identifier: 'test',
      spec: {
        environment: {
          environmentRef: 'test'
        },
        execution: { steps: [] }
      }
    })
  ).toBe(true)
  expect(
    hasStageData({
      name: 'test',
      identifier: 'test',
      spec: {
        execution: { steps: [] }
      }
    })
  ).toBe(false)
})

test('isServiceEntityPresent', () => {
  expect(
    isServiceEntityPresent({
      name: 'test',
      identifier: 'test',
      spec: {
        service: {
          serviceRef: 'test'
        },
        execution: { steps: [] }
      }
    })
  ).toBe(true)
  expect(
    isServiceEntityPresent({
      identifier: 'test',
      name: 'test',
      spec: {
        execution: {
          steps: []
        }
      }
    })
  ).toBe(false)
})

test('isEnvironmentGroupPresent', () => {
  expect(
    isEnvironmentGroupPresent({
      name: 'test',
      identifier: 'test',
      spec: {
        environmentGroup: {
          envGroupRef: 'test'
        },
        execution: { steps: [] }
      }
    })
  ).toBe(true)
  expect(
    isEnvironmentGroupPresent({
      identifier: 'test',
      name: 'test',
      spec: {
        execution: {
          steps: []
        }
      }
    })
  ).toBe(false)
})

test('isEnvironmentPresent', () => {
  expect(
    isEnvironmentPresent({
      name: 'test',
      identifier: 'test',
      spec: {
        environment: {
          environmentRef: 'test'
        },
        execution: { steps: [] }
      }
    })
  ).toBe(true)
  expect(
    isEnvironmentPresent({
      identifier: 'test',
      name: 'test',
      spec: {
        execution: {
          steps: []
        }
      }
    })
  ).toBe(false)
})

test('isExecutionFieldPresent', () => {
  expect(
    isExecutionFieldPresent({
      name: 'test',
      identifier: 'test',
      spec: {
        execution: { steps: [] }
      }
    })
  ).toBe(false)
  expect(
    isExecutionFieldPresent({
      identifier: 'test',
      name: 'test',
      spec: {
        execution: {
          steps: []
        }
      }
    })
  ).toBe(false)
})
