/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, get, isEmpty, unset } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import * as Yup from 'yup'
import { AllowedTypes, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { Scope } from '@common/interfaces/SecretsInterface'
import type { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ListType, SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'

import type {
  InlineTerraformVarFileSpec,
  StepElementConfig,
  StringNGVariable,
  TerraformApplyStepInfo,
  TerraformBackendConfig,
  TerraformCloudCliPlanExecutionData,
  TerraformConfigFilesWrapper,
  TerraformDestroyStepInfo,
  TerraformPlanExecutionData,
  TerraformPlanStepInfo,
  TerraformRollbackStepInfo,
  TerraformStepConfiguration,
  TerraformVarFileWrapper
} from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { UseStringsReturn } from 'framework/strings'
import { IdentifierSchemaWithOutName } from '@common/utils/Validation'

export const TerraformStoreTypes = {
  Inline: 'Inline',
  Remote: 'Remote'
}
export interface TerraformProps<T = TerraformData> {
  initialValues: T
  onUpdate?: (data: T) => void
  onChange?: (data: T) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  configTypes?: SelectOption[]
  isNewStep?: boolean
  inputSetData?: {
    template?: T
    path?: string
  }
  readonly?: boolean
  path?: string
  stepType?: string
  gitScope?: GitFilterScope
  allValues?: T
  isBackendConfig?: boolean
}

export interface TerraformPlanProps {
  initialValues: TFPlanFormData
  onUpdate?: (data: TFPlanFormData) => void
  onChange?: (data: TFPlanFormData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  configTypes?: SelectOption[]
  isNewStep?: boolean
  inputSetData?: {
    template?: TFPlanFormData
    path?: string
  }
  path?: string
  readonly?: boolean
  gitScope?: GitFilterScope
  stepType?: string
  allValues?: TFPlanFormData
  isBackendConfig?: boolean
}

export interface RemoteVar {
  varFile: {
    identifier?: string
    spec?: {
      store?: {
        spec?: {
          gitFetchType?: string
          repoName?: string
          branch?: string
          commitId?: string
          connectorRef?: {
            label: string
            value: string
            scope: Scope
            live: boolean
            connector: { type: string; spec: { val: string } }
          }
          paths?: PathInterface[]
          content?: string
        }
      }
    }
  }
}

export interface TerraformPlanVariableStepProps {
  initialValues: TFPlanFormData
  originalData?: TFPlanFormData
  stageIdentifier?: string
  onUpdate?(data: TFPlanFormData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData?: TFPlanFormData
  fieldPath?: string
}

export interface TerraformVariableStepProps {
  initialValues: TerraformData
  originalData?: TerraformData
  stageIdentifier?: string
  onUpdate?(data: TerraformData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData?: TerraformData
  stepType?: string
  fieldPath?: string
}

export const ConfigurationTypes: Record<TerraformStepConfiguration['type'], TerraformStepConfiguration['type']> = {
  Inline: 'Inline',
  InheritFromPlan: 'InheritFromPlan',
  InheritFromApply: 'InheritFromApply'
}
export const BackendConfigurationTypes = {
  Inline: 'Inline',
  Remote: 'Remote'
}

export const CommandTypes = {
  Apply: 'Apply',
  Destroy: 'Destroy'
}
export interface PathInterface {
  [x: string]: any
  path: string
}

export interface EnvironmentVar {
  key: string
  value: string
}

export interface BackendConfig {
  type: string
  spec: {
    content?: string
  }
}
export interface VarFileArray {
  varFile: {
    type?: string
    store?: {
      spec?: {
        gitFetchType?: string
        repoName?: string
        branch?: string
        commitId?: string
        connectorRef?: {
          label: string
          value: string
          scope: Scope
          live: boolean
          connector: { type: string; spec: { val: string } }
        }
        paths?: PathInterface[]
        content?: string
      }
    }
  }
}

export interface ConfigFileData {
  spec?: {
    configuration?: {
      spec?: TerraformApplyStepInfo
    }
  }
}

export interface TFPlanConfig {
  spec?: {
    configuration?: TerraformPlanExecutionData
  }
}

export interface Connector {
  label: string
  value: string
  scope: Scope
  live: boolean
  connector: {
    type: string
    identifier: string
    name: string
    spec: { val: string; url: string; connectionType?: string; type?: string }
  }
}
export interface TerraformData extends StepElementConfig {
  spec?: {
    provisionerIdentifier?: string
    configuration?: {
      type?: 'Inline' | 'InheritFromPlan' | 'InheritFromApply'
      spec?: TFDataSpec
    }

    cloudCliConfiguration?: Omit<TerraformCloudCliPlanExecutionData, 'environmentVariables' | 'targets'> & {
      targets?: Array<{ id: string; value: string }> | string[] | string
      environmentVariables?: Array<{ key: string; id: string; value: string }> | string
    }
  }
}

export interface TerraformPlanData extends StepElementConfig {
  spec?: TerraformPlanStepInfo
}

export interface TFDataSpec {
  workspace?: string
  backendConfig?:
    | TerraformBackendConfig
    | {
        store?: {
          type?: string
          spec?: {
            gitFetchType?: string
            branch?: string
            commitId?: string
            folderPath?: string
            connectorRef?: string | Connector
            repositoryName?: string
            artifactPaths?: string
          }
        }
      }
  targets?: any

  environmentVariables?: any
  configFiles?: {
    store?: {
      type?: string
      spec?: {
        gitFetchType?: string
        branch?: string
        commitId?: string
        folderPath?: string
        connectorRef?: string | Connector
        repositoryName?: string
        artifactPaths?: string
      }
    }
  }
  varFiles?: TerraformVarFileWrapper[]
  exportTerraformPlanJson?: boolean
  exportTerraformHumanReadablePlan?: boolean
}

export interface TFFormData extends StepElementConfig {
  spec?: TerraformApplyStepInfo
}

export interface TFDestroyData extends StepElementConfig {
  spec?: TerraformDestroyStepInfo
}

export interface TFRollbackData extends StepElementConfig {
  spec: TerraformRollbackStepInfo
}

export interface TFPlanFormData extends StepElementConfig {
  spec?: Omit<TerraformPlanStepInfo, 'configuration' | 'cloudCliConfiguration'> & {
    configuration?: Omit<TerraformPlanExecutionData, 'environmentVariables' | 'targets'> & {
      targets?: Array<{ id: string; value: string }> | string[] | string
      environmentVariables?: Array<{ key: string; id: string; value: string }> | string
    }
    cloudCliConfiguration?: Omit<TerraformCloudCliPlanExecutionData, 'environmentVariables' | 'targets'> & {
      targets?: Array<{ id: string; value: string }> | string[] | string
      environmentVariables?: Array<{ key: string; id: string; value: string }> | string
    }
  }
}

export interface TerraformFormData extends StepElementConfig {
  delegateSelectors: string[]
  spec?: TerraformPlanStepInfo
}

export interface TfVar {
  type?: string
  connectorRef?: {
    label: string
    scope: Scope
    value: string
  }
  gitFetchType?: string
  repoName?: string
  branch?: string
  commitId?: string
  paths?: string[]
}

export const onSubmitTerraformData = (values: any): TerraformData => {
  const fieldPath = values.spec?.configuration ? 'configuration' : 'cloudCliConfiguration'
  const envVars = get(values.spec, `${fieldPath}.spec.environmentVariables`)
  const targets = get(values.spec, `${fieldPath}.spec.targets`) as MultiTypeInputType

  if (values?.spec?.configuration?.type === 'Inline' || values?.spec?.cloudCliConfiguration) {
    const envMap: StringNGVariable[] = []
    if (Array.isArray(envVars)) {
      envVars.forEach(mapValue => {
        if (mapValue.value) {
          envMap.push({
            name: mapValue.key,
            value: mapValue.value,
            type: 'String'
          })
        }
      })
    }

    const targetMap: ListType = []
    if (Array.isArray(targets)) {
      targets.forEach(target => {
        if (target.value) {
          targetMap.push(target.value)
        }
      })
    }

    const connectorValue = get(values.spec, `${fieldPath}.spec.configFiles.store.spec.connectorRef`) as any
    const backendConfigConnectorValue = get(
      values.spec,
      `${fieldPath}.spec.backendConfig.spec.store.spec.connectorRef`
    ) as any

    const configObject: any = {
      workspace: values?.spec?.configuration?.spec?.workspace,
      configFiles: {} as any
    }
    if (get(values.spec, `${fieldPath}.spec.backendConfig.spec.content`)) {
      configObject['backendConfig'] = {
        type: BackendConfigurationTypes.Inline,
        spec: {
          content: get(values.spec, `${fieldPath}.spec.backendConfig.spec.content`)
        }
      }
    } else if (get(values.spec, `${fieldPath}.spec.backendConfig.spec.store`)) {
      if (get(values.spec, `${fieldPath}.spec.backendConfig.spec.store.type`) === 'Harness') {
        configObject['backendConfig'] = { ...get(values.spec, `${fieldPath}.spec.backendConfig`) }
      } else {
        if (backendConfigConnectorValue) {
          configObject['backendConfig'] = {
            type: BackendConfigurationTypes.Remote,
            ...get(values.spec, `${fieldPath}.spec.backendConfig`),
            spec: {
              store: {
                ...get(values.spec, `${fieldPath}.spec.backendConfig.spec.store`),
                type:
                  backendConfigConnectorValue?.connector?.type ||
                  get(values.spec, `${fieldPath}.spec.backendConfig.spec.store.type`),
                spec: {
                  ...get(values.spec, `${fieldPath}.spec.backendConfig.spec.store.spec`),
                  connectorRef:
                    getMultiTypeFromValue(backendConfigConnectorValue) === MultiTypeInputType.RUNTIME ||
                    !backendConfigConnectorValue?.value
                      ? backendConfigConnectorValue
                      : backendConfigConnectorValue?.value
                }
              }
            }
          }
        } else {
          unset(get(values.spec, `${fieldPath}.spec`), 'backendConfig')
        }
      }
    } else {
      unset(get(values.spec, `${fieldPath}.spec`), 'backendConfig')
    }

    if (envMap.length) {
      configObject['environmentVariables'] = envMap
    }

    if (targetMap.length) {
      configObject['targets'] = targetMap
    } else if (getMultiTypeFromValue(targets) === MultiTypeInputType.RUNTIME) {
      configObject['targets'] = targets
    }

    if (get(values.spec, `${fieldPath}.spec?.varFiles`)?.length) {
      configObject['varFiles'] = get(values.spec, `${fieldPath}.spec?.varFiles`)
    } else {
      unset(get(values.spec, `${fieldPath}.spec`), 'varFiles')
    }

    if (connectorValue || getMultiTypeFromValue(connectorValue) === MultiTypeInputType.RUNTIME) {
      configObject['configFiles'] = {
        ...get(values.spec, `${fieldPath}.spec.configFiles`),
        store: {
          ...get(values.spec, `${fieldPath}.spec.configFiles.store`),
          type: get(values.spec, `${fieldPath}.spec.configFiles.store.type`),
          spec: {
            ...get(values.spec, `${fieldPath}.spec.configFiles.store.spec`),
            connectorRef:
              getMultiTypeFromValue(connectorValue) === MultiTypeInputType.RUNTIME || !connectorValue?.value
                ? connectorValue
                : connectorValue?.value
          }
        }
      }
    }

    if (get(values.spec, `${fieldPath}.spec.configFiles.store.type`) === 'Harness') {
      configObject['configFiles'] = { ...get(values.spec, `${fieldPath}.spec.configFiles`) }
    }

    if (values.spec?.configuration) {
      delete values.spec?.cloudCliConfiguration
      return {
        ...values,
        spec: {
          ...values.spec,
          configuration: {
            type: values?.spec?.configuration?.type,
            spec: {
              ...configObject
            }
          }
        }
      }
    } else if (values?.spec?.cloudCliConfiguration) {
      delete values.spec?.configuration
      return {
        ...values,
        spec: {
          ...values.spec,
          cloudCliConfiguration: {
            spec: {
              ...configObject
            }
          }
        }
      }
    }
  }

  return {
    ...values,
    spec: {
      ...values.spec,
      provisionerIdentifier: values?.spec?.provisionerIdentifier,
      configuration: {
        type: values?.spec?.configuration?.type
      }
    }
  }
}

export const onSubmitTFPlanData = (values: any): TFPlanFormData => {
  const fieldPath = values.spec?.configuration ? 'configuration' : 'cloudCliConfiguration'
  const envVars = get(values.spec, `${fieldPath}.environmentVariables`)
  const envMap: StringNGVariable[] = []
  if (Array.isArray(envVars)) {
    envVars.forEach(mapValue => {
      if (mapValue.value) {
        envMap.push({
          name: mapValue.key,
          value: mapValue.value,
          type: 'String'
        })
      }
    })
  }

  const targets = get(values.spec, `${fieldPath}.targets`) as MultiTypeInputType
  const targetMap: ListType = []
  if (Array.isArray(targets)) {
    targets.forEach(target => {
      if (target.value) {
        targetMap.push(target.value)
      }
    })
  }

  const connectorValue = get(values.spec, `${fieldPath}.configFiles.store.spec.connectorRef`)
  const backendConfigConnectorValue = get(values.spec, `${fieldPath}.backendConfig.spec.store.spec.connectorRef`)

  const configObject: any = {
    command: get(values.spec, `${fieldPath}.command`),
    configFiles: {} as TerraformConfigFilesWrapper
  }

  if (get(values.spec, `${fieldPath}.backendConfig.spec.content`)) {
    configObject['backendConfig'] = {
      type: BackendConfigurationTypes.Inline,
      spec: {
        content: get(values.spec, `${fieldPath}.backendConfig.spec.content`)
      }
    }
  } else if (get(values.spec, `${fieldPath}.backendConfig.spec.store`)) {
    if (get(values.spec, `${fieldPath}.backendConfig.spec.store.type`) === 'Harness') {
      configObject['backendConfig'] = { ...get(values.spec, `${fieldPath}.backendConfig`) }
    } else {
      if (backendConfigConnectorValue) {
        configObject['backendConfig'] = {
          type: BackendConfigurationTypes.Remote,
          ...get(values.spec, `${fieldPath}.backendConfig`),
          spec: {
            store: {
              ...get(values.spec, `${fieldPath}.backendConfig.spec.store`),
              type:
                backendConfigConnectorValue?.connector?.type ||
                get(values.spec, `${fieldPath}.backendConfig.spec.store.type`),
              spec: {
                ...get(values.spec, `${fieldPath}.backendConfig.spec.store.spec`),
                connectorRef:
                  getMultiTypeFromValue(backendConfigConnectorValue) === MultiTypeInputType.RUNTIME ||
                  !backendConfigConnectorValue?.value
                    ? backendConfigConnectorValue
                    : backendConfigConnectorValue?.value
              }
            }
          }
        }
      } else {
        unset(get(values.spec, `${fieldPath}`), 'backendConfig')
      }
    }
  } else {
    unset(get(values.spec, `${fieldPath}`), 'backendConfig')
  }

  if (envMap.length) {
    configObject['environmentVariables'] = envMap
  } else if (
    getMultiTypeFromValue(get(values.spec, `${fieldPath}.environmentVariables`)) === MultiTypeInputType.RUNTIME
  ) {
    configObject['environmentVariables'] = get(values.spec, `${fieldPath}.environmentVariables`)
  }

  if (targetMap.length) {
    configObject['targets'] = targetMap
  } else if (getMultiTypeFromValue(get(values.spec, `${fieldPath}.targets`)) === MultiTypeInputType.RUNTIME) {
    configObject['targets'] = get(values.spec, `${fieldPath}.targets`)
  }

  if (get(values.spec, `${fieldPath}.varFiles`)?.length) {
    configObject['varFiles'] = get(values.spec, `${fieldPath}.varFiles`)
  }

  if (connectorValue || getMultiTypeFromValue(connectorValue) === MultiTypeInputType.RUNTIME) {
    configObject['configFiles'] = {
      ...get(values.spec, `${fieldPath}.configFiles`),
      store: {
        ...get(values.spec, `${fieldPath}.configFiles.store`),
        type: get(values.spec, `${fieldPath}.configFiles.store.type`),
        spec: {
          ...get(values.spec, `${fieldPath}.configFiles.store.spec`),
          connectorRef:
            getMultiTypeFromValue(connectorValue) === MultiTypeInputType.RUNTIME || !connectorValue?.value
              ? connectorValue
              : connectorValue?.value
        }
      }
    }
  }

  if (get(values.spec, `${fieldPath}.configFiles.store.type`) === 'Harness') {
    configObject['configFiles'] = { ...get(values.spec, `${fieldPath}.configFiles`) }
  }

  if (values.spec?.configuration?.secretManagerRef) {
    configObject['secretManagerRef'] = values?.spec?.configuration?.secretManagerRef
      ? values?.spec?.configuration?.secretManagerRef
      : ''
  }

  if (values.spec?.configuration?.workspace) {
    configObject['workspace'] = values?.spec?.configuration?.workspace ? values?.spec?.configuration?.workspace : ''
  }

  if (values?.spec?.configuration?.exportTerraformPlanJson) {
    configObject['exportTerraformPlanJson'] = values?.spec?.configuration?.exportTerraformPlanJson
      ? values?.spec?.configuration?.exportTerraformPlanJson
      : false
  }

  if (values?.spec?.configuration?.exportTerraformHumanReadablePlan) {
    configObject['exportTerraformHumanReadablePlan'] = values?.spec?.configuration?.exportTerraformHumanReadablePlan
      ? values?.spec?.configuration?.exportTerraformHumanReadablePlan
      : false
  }

  if (values.spec?.configuration) {
    unset(values, 'spec.cloudCliConfiguration')
    return {
      ...values,
      spec: {
        ...values.spec,
        configuration: {
          ...configObject
        }
      }
    }
  } else {
    unset(values, 'spec.configuration')
    return {
      ...values,
      spec: {
        ...values.spec,
        cloudCliConfiguration: {
          ...configObject
        }
      }
    }
  }
}
export interface InlineVar {
  varFile: {
    identifier: string
    spec: InlineTerraformVarFileSpec
  }
}

export const getTFPlanInitialValues = (data: TFPlanFormData): TFPlanFormData => {
  const path = data.spec?.configuration
    ? 'spec.configuration'
    : data.spec?.cloudCliConfiguration
    ? 'spec.cloudCliConfiguration'
    : ''
  const envVars = get(data, `${path}.environmentVariables`) as StringNGVariable[]
  const isEnvRunTime = getMultiTypeFromValue(envVars as any) === MultiTypeInputType.RUNTIME
  const isTargetRunTime = getMultiTypeFromValue(get(data, `${path}.targets`) as any) === MultiTypeInputType.RUNTIME

  const tfPlanSpec = {
    ...get(data, path),
    command: get(data, `${path}.command`, CommandTypes.Apply),
    targets: !isTargetRunTime
      ? Array.isArray(get(data, `${path}.targets`))
        ? (get(data, `${path}.targets`) as string[]).map((target: string) => ({
            value: target,
            id: uuid()
          }))
        : [{ value: '', id: uuid() }]
      : get(data, `${path}.targets`),
    environmentVariables: !isEnvRunTime
      ? Array.isArray(envVars)
        ? envVars.map(variable => ({
            key: variable.name || '',
            value: variable?.value,
            id: uuid()
          }))
        : [{ key: '', value: '', id: uuid() }]
      : get(data, `${path}.environmentVariables`)
  }

  return {
    ...data,
    ...(!isEmpty(path) && {
      spec: {
        ...data.spec,
        ...(path === 'spec.configuration'
          ? { configuration: { ...tfPlanSpec } }
          : { cloudCliConfiguration: { ...tfPlanSpec } })
      }
    })
  }
}

export const getTerraformInitialValues = (data: any): TerraformData => {
  const path = data.spec?.configuration
    ? 'spec.configuration'
    : data.spec?.cloudCliConfiguration
    ? 'spec.cloudCliConfiguration'
    : ''
  const envVars = get(data, `${path}.spec.environmentVariables`) as StringNGVariable[]
  const terraformSpec = {
    ...get(data, `${path}.spec`),
    targets: Array.isArray(get(data, `${path}.spec.targets`))
      ? get(data, `${path}.spec.targets`).map((target: any) => ({
          value: target,
          id: uuid()
        }))
      : [{ value: '', id: uuid() }],
    environmentVariables: Array.isArray(get(data, `${path}.spec.environmentVariables`))
      ? envVars.map(variable => ({
          key: variable.name,
          value: variable.value,
          id: uuid()
        }))
      : [{ key: '', value: '', id: uuid() }]
  }

  return {
    ...data,
    ...(!isEmpty(path) && {
      spec: {
        ...data.spec,
        ...(path === 'spec.configuration'
          ? {
              configuration: {
                type: defaultTo(data.spec?.configuration?.type, ConfigurationTypes.Inline),
                spec: { ...terraformSpec }
              }
            }
          : { cloudCliConfiguration: { spec: { ...terraformSpec } } })
      }
    })
  }
}

export const provisionerIdentifierValidation = (getString: UseStringsReturn['getString']): Yup.Schema<unknown> => {
  return Yup.lazy((value): Yup.Schema<unknown> => {
    if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
      return IdentifierSchemaWithOutName(getString, {
        requiredErrorMsg: getString('common.validation.provisionerIdentifierIsRequired'),
        regexErrorMsg: getString('common.validation.provisionerIdentifierPatternIsNotValid')
      })
    }
    return Yup.string().required(getString('common.validation.provisionerIdentifierIsRequired'))
  })
}
