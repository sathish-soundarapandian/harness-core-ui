/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import * as Yup from 'yup'
import { FormikErrors, yupToFormErrors } from 'formik'
import { get, isEmpty } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import { getNameAndIdentifierSchema } from '@pipeline/utils/tempates'
import {
  getFailureStrategiesValidationSchema,
  getVariablesValidationField
} from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/validation'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { GetExecutionStrategyYamlQueryParams } from 'services/cd-ng'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/helper'

const namespaceRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/
const releaseNameRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/

export enum InfraDeploymentType {
  KubernetesDirect = 'KubernetesDirect',
  KubernetesGcp = 'KubernetesGcp',
  PDC = 'Pdc',
  KubernetesAzure = 'KubernetesAzure',
  ServerlessAwsLambda = 'ServerlessAwsLambda',
  ServerlessGoogleFunctions = 'ServerlessGoogleFunctions',
  ServerlessAzureFunctions = 'ServerlessAzureFunctions',
  AmazonSAM = 'AwsSAM',
  AzureFunctions = 'AzureFunctions',
  SshWinRmAws = 'SshWinRmAws',
  SshWinRmAzure = 'SshWinRmAzure',
  AzureWebApp = 'AzureWebApp',
  ECS = 'ECS',
  Asg = 'Asg',
  CustomDeployment = 'CustomDeployment',
  Elastigroup = 'Elastigroup',
  TAS = 'TAS',
  GoogleCloudFunctions = 'GoogleCloudFunctions'
}

export const deploymentTypeToInfraTypeMap = {
  [ServiceDeploymentType.ServerlessAwsLambda]: InfraDeploymentType.ServerlessAwsLambda,
  [ServiceDeploymentType.ServerlessAzureFunctions]: InfraDeploymentType.ServerlessAzureFunctions,
  [ServiceDeploymentType.ServerlessGoogleFunctions]: InfraDeploymentType.ServerlessGoogleFunctions,
  [ServiceDeploymentType.Ssh]: InfraDeploymentType.PDC
}

export const setupMode = {
  PROPAGATE: 'PROPAGATE',
  DIFFERENT: 'DIFFERENT'
}

export function getNameSpaceSchema(
  getString: UseStringsReturn['getString'],
  isRequired = true
): Yup.StringSchema<string | undefined> {
  const namespaceSchema = Yup.string().test('namespace', getString('cd.namespaceValidation'), function (value) {
    if (getMultiTypeFromValue(value) !== MultiTypeInputType.FIXED || isEmpty(value)) {
      return true
    }
    return namespaceRegex.test(value)
  })
  if (isRequired) {
    return namespaceSchema.required(getString('fieldRequired', { field: getString('common.namespace') }))
  }
  return namespaceSchema
}
export function getReleaseNameSchema(
  getString: UseStringsReturn['getString'],
  isRequired = true
): Yup.StringSchema<string | undefined> {
  const releaseNameSchema = Yup.string().test('releaseName', getString('cd.releaseNameValidation'), function (value) {
    if (getMultiTypeFromValue(value) !== MultiTypeInputType.FIXED || isEmpty(value)) {
      return true
    }
    return releaseNameRegex.test(value)
  })
  if (isRequired) {
    return releaseNameSchema.required(getString('fieldRequired', { field: getString('common.releaseName') }))
  }
  return releaseNameSchema
}

export function getValidationSchemaWithRegion(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    connectorRef: getConnectorSchema(getString),
    region: Yup.lazy((): Yup.Schema<unknown> => {
      return Yup.string().required(getString('validation.regionRequired'))
    }),
    stage: Yup.lazy((): Yup.Schema<unknown> => {
      return Yup.string().required(getString('cd.pipelineSteps.infraTab.stageIsRequired'))
    })
  })
}

export function getValidationSchema(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    connectorRef: getConnectorSchema(getString),
    stage: Yup.lazy((): Yup.Schema<unknown> => {
      return Yup.string().required(getString('cd.pipelineSteps.infraTab.stageIsRequired'))
    })
  })
}

export function getConnectorSchema(getString: UseStringsReturn['getString']): Yup.StringSchema<string | undefined> {
  return Yup.string().required(getString('fieldRequired', { field: getString('connector') }))
}

export function getCredentialsRefSchema(
  getString: UseStringsReturn['getString']
): Yup.StringSchema<string | undefined> {
  return Yup.string().required(getString('fieldRequired', { field: getString('connector') }))
}

export function getServiceRefSchema(getString: UseStringsReturn['getString']): Yup.StringSchema<string | undefined> {
  return Yup.string().trim().required(getString('cd.pipelineSteps.serviceTab.serviceIsRequired'))
}

export function getEnvironmentRefSchema(
  getString: UseStringsReturn['getString']
): Yup.StringSchema<string | undefined> {
  return Yup.string().trim().required(getString('cd.pipelineSteps.environmentTab.environmentIsRequired'))
}

export function getServiceDeploymentTypeSchema(
  getString: UseStringsReturn['getString']
): Yup.StringSchema<string | undefined> {
  return Yup.string()
    .oneOf(Object.values(ServiceDeploymentType))
    .required(getString('cd.pipelineSteps.serviceTab.deploymentTypeRequired'))
}

export function getInfraDeploymentTypeSchema(
  getString: UseStringsReturn['getString']
): Yup.StringSchema<string | undefined> {
  return Yup.string()
    .oneOf(Object.values(InfraDeploymentType))
    .required(getString('cd.pipelineSteps.infraTab.deploymentType'))
}

export const getInfrastructureDefinitionValidationSchema = (
  deploymentType: GetExecutionStrategyYamlQueryParams['serviceDefinitionType'],
  getString: UseStringsReturn['getString']
) => {
  switch (deploymentType) {
    case ServiceDeploymentType.ServerlessAwsLambda:
      return getValidationSchemaWithRegion(getString)
    case ServiceDeploymentType.Ssh:
      return Yup.object().shape({
        credentialsRef: getCredentialsRefSchema(getString)
      })
    case ServiceDeploymentType.WinRm:
      return Yup.object().shape({})
    case ServiceDeploymentType.ECS:
      return getECSInfraValidationSchema(getString)
    default:
      return Yup.object().shape({
        connectorRef: getConnectorSchema(getString),
        namespace: getNameSpaceSchema(getString),
        releaseName: getReleaseNameSchema(getString),
        cluster: Yup.mixed().test({
          test(val): boolean | Yup.ValidationError {
            const infraDeploymentType = get(this.options.context, 'spec.infrastructure.infrastructureDefinition.type')
            if (infraDeploymentType === InfraDeploymentType.KubernetesGcp) {
              if (isEmpty(val) || (typeof val === 'object' && isEmpty(val.value))) {
                return this.createError({
                  message: getString('fieldRequired', { field: getString('common.cluster') })
                })
              }
            }
            return true
          }
        })
      })
  }
}

function getServiceSchema(
  getString: UseStringsReturn['getString'],
  isNewServiceEnvEntity: boolean
): Record<string, Yup.Schema<unknown>> {
  return isNewServiceEnvEntity
    ? {
        service: Yup.object().shape({
          serviceRef: getServiceRefSchema(getString)
        })
      }
    : {
        serviceConfig: Yup.object().shape({
          serviceRef: getServiceRefSchema(getString),
          serviceDefinition: Yup.object().shape({
            type: getServiceDeploymentTypeSchema(getString),
            spec: Yup.object().shape(getVariablesValidationField(getString))
          })
        })
      }
}

function getEnvironmentInfraSchema(
  getString: UseStringsReturn['getString'],
  isNewEnvInfraDef: boolean,
  deploymentType: GetExecutionStrategyYamlQueryParams['serviceDefinitionType']
): Record<string, Yup.Schema<unknown>> {
  return isNewEnvInfraDef
    ? {
        environment: Yup.object().shape({
          environmentRef: getEnvironmentRefSchema(getString),
          infrastructureDefinitions: Yup.mixed().required()
        })
      }
    : {
        infrastructure: Yup.object().shape({
          environmentRef: getEnvironmentRefSchema(getString),
          infrastructureDefinition: Yup.object().shape({
            type: getInfraDeploymentTypeSchema(getString),
            spec: getInfrastructureDefinitionValidationSchema(deploymentType, getString)
          })
        })
      }
}

export function getCDStageValidationSchema(
  getString: UseStringsReturn['getString'],
  deploymentType: GetExecutionStrategyYamlQueryParams['serviceDefinitionType'],
  isNewServiceEnvEntity: boolean,
  isNewEnvInfraDef: boolean,
  contextType?: string
): Yup.Schema<unknown> {
  return Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, contextType),
    spec: Yup.object().shape({
      ...getServiceSchema(getString, isNewServiceEnvEntity),
      ...getEnvironmentInfraSchema(getString, isNewEnvInfraDef, deploymentType),
      execution: Yup.object().shape({
        steps: Yup.array().required().min(1, getString('common.executionTab.stepsCount'))
      })
    }),
    failureStrategies: getFailureStrategiesValidationSchema(getString),
    ...getVariablesValidationField(getString)
  })
}

export function getECSInfraValidationSchema(getString: UseStringsReturn['getString']) {
  return Yup.object().shape({
    connectorRef: getConnectorSchema(getString),
    region: Yup.lazy((): Yup.Schema<unknown> => {
      return Yup.string().required(getString('validation.regionRequired'))
    }),
    cluster: Yup.lazy((): Yup.Schema<unknown> => {
      return Yup.string().required(
        getString('common.validation.fieldIsRequired', { name: getString('common.cluster') })
      )
    })
  })
}

export function getAsgInfraValidationSchema(getString: UseStringsReturn['getString']) {
  return Yup.object().shape({
    connectorRef: getConnectorSchema(getString),
    region: Yup.lazy((): Yup.Schema<unknown> => {
      return Yup.string().required(getString('validation.regionRequired'))
    })
  })
}

export function getGoogleCloudFunctionInfraValidationSchema(getString: UseStringsReturn['getString']) {
  return Yup.object().shape({
    connectorRef: getConnectorSchema(getString),
    project: Yup.string().required(getString('common.validation.fieldIsRequired', { name: getString('projectLabel') })),
    region: Yup.string().required(getString('validation.regionRequired'))
  })
}

export const isMultiArtifactSourceEnabled = (
  isMultiArtifactSource: boolean,
  stage: DeploymentStageElementConfig,
  isServiceEntityPage: boolean
): boolean => {
  return (
    isMultiArtifactSource &&
    (isEmpty(stage?.spec?.serviceConfig?.serviceDefinition?.type) ||
      (isServiceEntityPage && isEmpty(stage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts?.primary?.type)))
  )
}

export const shouldFetchFieldData = (fieldList: string[]) => {
  const emptyOrRuntimeFields = fieldList.filter((currField: string) => {
    return (
      isEmpty(currField) ||
      getMultiTypeFromValue(currField) === MultiTypeInputType.RUNTIME ||
      getMultiTypeFromValue(currField) === MultiTypeInputType.EXPRESSION
    )
  })
  return emptyOrRuntimeFields.length === 0
}

export const checkEmptyOrLessThan = (value: any, minimumCount = 0): boolean => /* istanbul ignore next */ {
  if (typeof value === 'string') {
    return isEmpty(value)
  }
  if (typeof value === 'number') {
    return value < minimumCount
  }
  return false
}

export function validateGitOpsExecutionStepForm({
  data,
  template,
  getString,
  viewType
}: ValidateInputSetProps<any>): FormikErrors<any> {
  const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errors = {} as any
  // istanbul ignore next
  // istanbul ignore else
  if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
    // istanbul ignore next
    let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
    // istanbul ignore next
    if (isRequired) {
      // istanbul ignore next
      timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
    }
    const timeout = Yup.object().shape({
      timeout: timeoutSchema
    })

    try {
      timeout.validateSync(data)
    } catch (e) {
      /* istanbul ignore else */
      if (e instanceof Yup.ValidationError) {
        const err = yupToFormErrors(e)

        Object.assign(errors, err)
      }
    }
  }
  return errors
}
