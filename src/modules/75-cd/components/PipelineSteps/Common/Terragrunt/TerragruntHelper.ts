/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { unset } from 'lodash-es'
import type { IDialogProps } from '@blueprintjs/core'
import type { ListType } from '@common/components/List/List'
import type {
  StringNGVariable,
  TerragruntConfigFilesWrapper,
  TerragruntExecutionData,
  TerragruntModuleConfig,
  TerragruntPlanExecutionData
} from 'services/cd-ng'
import { BackendConfigurationTypes } from '../Terraform/TerraformInterfaces'
import type { TerragruntData, TGPlanFormData } from './TerragruntInterface'

export const onSubmitTerragruntData = (values: TerragruntData): TerragruntData => {
  const configObject: TerragruntExecutionData = {
    configFiles: {} as TerragruntConfigFilesWrapper,
    moduleConfig: {} as TerragruntModuleConfig,
    workspace: values.spec.configuration?.spec?.workspace
  }
  const envVars = values.spec.configuration?.spec?.environmentVariables
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

  const targets = values.spec.configuration?.spec?.targets as MultiTypeInputType
  const targetMap: ListType = []
  if (Array.isArray(targets)) {
    targets.forEach(target => {
      if (target.value) {
        targetMap.push(target.value)
      }
    })
  }
  const backendConfigConnectorValue = values.spec.configuration?.spec?.backendConfig?.spec?.store?.spec
    ?.connectorRef as any
  const connectorValue = values.spec.configuration?.spec?.configFiles?.store?.spec?.connectorRef as any

  if (values.spec.configuration?.type === 'Inline') {
    if (values.spec.configuration?.spec?.backendConfig?.spec?.content) {
      configObject['backendConfig'] = {
        type: BackendConfigurationTypes.Inline,
        spec: {
          content: values.spec.configuration.spec.backendConfig.spec.content
        }
      }
    } else if (values.spec.configuration?.spec?.backendConfig?.spec?.store) {
      if (values.spec.configuration?.spec?.backendConfig?.spec?.store?.type === 'Harness') {
        configObject['backendConfig'] = { ...values?.spec?.configuration?.spec?.backendConfig }
      } else {
        if (values.spec.configuration?.spec?.backendConfig?.spec?.store?.spec?.connectorRef) {
          configObject['backendConfig'] = {
            type: BackendConfigurationTypes.Remote,
            ...values.spec.configuration?.spec?.backendConfig,
            spec: {
              store: {
                ...values.spec.configuration?.spec?.backendConfig?.spec?.store,
                type:
                  backendConfigConnectorValue?.connector?.type ||
                  values.spec.configuration?.spec?.backendConfig?.spec?.store?.type,
                spec: {
                  ...values.spec.configuration?.spec?.backendConfig?.spec?.store?.spec,
                  connectorRef: values?.spec?.configuration?.spec?.backendConfig?.spec?.store?.spec?.connectorRef
                    ? getMultiTypeFromValue(
                        values.spec.configuration?.spec?.backendConfig?.spec?.store?.spec?.connectorRef
                      ) === MultiTypeInputType.RUNTIME || !backendConfigConnectorValue?.value
                      ? values.spec.configuration?.spec?.backendConfig?.spec?.store?.spec?.connectorRef
                      : backendConfigConnectorValue?.value
                    : ''
                }
              }
            }
          }
        } else {
          unset(values.spec.configuration?.spec, 'backendConfig')
        }
      }
    } else {
      unset(values.spec.configuration?.spec, 'backendConfig')
    }
    if (envMap.length) {
      configObject['environmentVariables'] = envMap
    }
    if (targetMap.length) {
      configObject['targets'] = targetMap
    } else if (getMultiTypeFromValue(values.spec.configuration?.spec?.targets) === MultiTypeInputType.RUNTIME) {
      configObject['targets'] = values.spec.configuration?.spec?.targets
    }
    if (values.spec.configuration?.spec?.varFiles?.length) {
      configObject['varFiles'] = values.spec.configuration?.spec?.varFiles
    } else {
      unset(values.spec.configuration?.spec, 'varFiles')
    }

    if (
      connectorValue ||
      getMultiTypeFromValue(values.spec.configuration?.spec?.configFiles?.store?.spec?.connectorRef) ===
        MultiTypeInputType.RUNTIME
    ) {
      configObject['configFiles'] = {
        ...values.spec.configuration?.spec?.configFiles,
        store: {
          ...values.spec.configuration?.spec?.configFiles?.store,
          type: values.spec.configuration?.spec?.configFiles?.store?.type,
          spec: {
            ...values.spec.configuration?.spec?.configFiles?.store?.spec,
            connectorRef: values.spec.configuration?.spec?.configFiles?.store?.spec?.connectorRef
              ? getMultiTypeFromValue(values?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef) ===
                  MultiTypeInputType.RUNTIME || !connectorValue?.value
                ? values.spec.configuration?.spec?.configFiles?.store?.spec?.connectorRef
                : connectorValue?.value
              : ''
          }
        }
      }
    }

    if (values.spec.configuration?.spec?.moduleConfig) {
      configObject['moduleConfig'] = values.spec.configuration.spec?.moduleConfig as TerragruntModuleConfig
    }
    return {
      ...values,
      spec: {
        ...values.spec,
        provisionerIdentifier: values.spec.provisionerIdentifier,
        configuration: {
          type: values.spec.configuration?.type,
          spec: {
            ...configObject
          }
        }
      }
    }
  }

  return {
    ...values,
    spec: {
      ...values.spec,
      provisionerIdentifier: values.spec.provisionerIdentifier,
      configuration: {
        type: values.spec.configuration?.type
      }
    }
  }
}

export const onSubmitTGPlanData = (values: any): TGPlanFormData => {
  const envVars = values.spec.configuration?.environmentVariables
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

  const targets = values.spec.configuration?.targets as MultiTypeInputType
  const targetMap: ListType = []
  if (Array.isArray(targets)) {
    targets.forEach(target => {
      if (target.value) {
        targetMap.push(target.value)
      }
    })
  }

  const connectorValue = values.spec.configuration?.configFiles?.store?.spec?.connectorRef
  const backendConfigConnectorValue = values.spec.configuration?.backendConfig?.spec?.store?.spec?.connectorRef

  const configObject: TerragruntPlanExecutionData = {
    command: values.spec.configuration?.command,
    workspace: values.spec.configuration?.workspace,
    configFiles: {} as TerragruntConfigFilesWrapper,
    moduleConfig: {} as TerragruntModuleConfig,
    secretManagerRef: ''
  }

  if (values.spec.configuration?.moduleConfig) {
    configObject['moduleConfig'] = values.spec.configuration.moduleConfig
  }

  if (values.spec.configuration?.backendConfig?.spec?.content) {
    configObject['backendConfig'] = {
      type: BackendConfigurationTypes.Inline,
      spec: {
        content: values.spec.configuration.backendConfig.spec.content
      }
    }
  } else if (values.spec.configuration?.backendConfig?.spec?.store?.spec) {
    if (values.spec.configuration?.backendConfig?.spec?.store?.type === 'Harness') {
      configObject['backendConfig'] = { ...values?.spec?.configuration?.backendConfig }
    } else {
      if (values.spec.configuration?.backendConfig?.spec?.store?.spec?.connectorRef) {
        configObject['backendConfig'] = {
          type: BackendConfigurationTypes.Remote,
          ...values.spec.configuration?.backendConfig,
          spec: {
            store: {
              ...values.spec.configuration?.backendConfig?.spec?.store,
              type:
                backendConfigConnectorValue?.connector?.type ||
                values.spec.configuration?.backendConfig?.spec?.store?.type,
              spec: {
                ...values.spec.configuration?.backendConfig?.spec?.store?.spec,
                connectorRef: values.spec.configuration?.backendConfig?.spec?.store?.spec?.connectorRef
                  ? getMultiTypeFromValue(values.spec.configuration?.backendConfig?.spec?.store?.spec?.connectorRef) ===
                      MultiTypeInputType.RUNTIME || !backendConfigConnectorValue?.value
                    ? values.spec.configuration?.backendConfig?.spec?.store?.spec?.connectorRef
                    : backendConfigConnectorValue?.value
                  : ''
              }
            }
          }
        }
      } else {
        unset(values.spec.configuration, 'backendConfig')
      }
    }
  } else {
    unset(values.spec.configuration, 'backendConfig')
  }

  if (envMap.length) {
    configObject['environmentVariables'] = envMap
  } else if (getMultiTypeFromValue(values.spec.configuration?.environmentVariables) === MultiTypeInputType.RUNTIME) {
    configObject['environmentVariables'] = values.spec.configuration?.environmentVariables
  }

  if (targetMap.length) {
    configObject['targets'] = targetMap
  } else if (getMultiTypeFromValue(values.spec.configuration?.targets) === MultiTypeInputType.RUNTIME) {
    configObject['targets'] = values.spec.configuration?.targets
  }

  if (values.spec.configuration?.varFiles?.length) {
    configObject['varFiles'] = values.spec.configuration?.varFiles
  }

  if (
    connectorValue ||
    getMultiTypeFromValue(values.spec.configuration?.configFiles?.store?.spec?.connectorRef) ===
      MultiTypeInputType.RUNTIME
  ) {
    configObject['configFiles'] = {
      ...values.spec?.configuration?.configFiles,
      store: {
        ...values.spec.configuration?.configFiles?.store,
        type: values.spec.configuration?.configFiles?.store?.type,
        spec: {
          ...values.spec.configuration?.configFiles?.store?.spec,
          connectorRef: values.spec.configuration?.configFiles?.store?.spec?.connectorRef
            ? getMultiTypeFromValue(values?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef) ===
                MultiTypeInputType.RUNTIME || !connectorValue?.value
              ? values?.spec?.configuration?.configFiles?.store?.spec?.connectorRef
              : connectorValue?.value
            : ''
        }
      }
    }
  }

  if (values.spec.configuration?.secretManagerRef) {
    configObject['secretManagerRef'] = values?.spec?.configuration?.secretManagerRef
      ? values?.spec?.configuration?.secretManagerRef
      : ''
  }

  if (values.spec.configuration?.exportTerragruntPlanJson) {
    configObject['exportTerragruntPlanJson'] = values?.spec?.configuration?.exportTerragruntPlanJson
      ? values?.spec?.configuration?.exportTerragruntPlanJson
      : false
  }

  return {
    ...values,
    spec: {
      ...values.spec,
      configuration: {
        ...configObject
      }
    }
  }
}

export const DIALOG_PROPS: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: false,
  style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
}
