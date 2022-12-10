import { unset } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { ListType } from '@common/components/List/List'
import type {
  StringNGVariable,
  TerragruntConfigFilesWrapper,
  TerragruntExecutionData,
  TerragruntModuleConfig
} from 'services/cd-ng'
import { BackendConfigurationTypes } from '../Terraform/TerraformInterfaces'
import type { TGFormData } from './TerragruntInterface'

export const onSubmitTerragruntData = (values: any): TGFormData => {
  const configObject: TerragruntExecutionData = {
    workspace: values?.spec?.configuration?.spec?.workspace,
    configFiles: {} as TerragruntConfigFilesWrapper,
    moduleConfig: {} as TerragruntModuleConfig
  }
  const envVars = values.spec?.configuration?.spec?.environmentVariables
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

  const targets = values?.spec?.configuration?.spec?.targets as MultiTypeInputType
  const targetMap: ListType = []
  if (Array.isArray(targets)) {
    targets.forEach(target => {
      if (target.value) {
        targetMap.push(target.value)
      }
    })
  }
  const backendConfigConnectorValue = values?.spec?.configuration?.spec?.backendConfig?.spec?.store?.spec
    ?.connectorRef as any
  const connectorValue = values?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef as any

  if (values?.spec?.configuration?.type === 'Inline') {
    if (values?.spec?.configuration?.spec?.backendConfig?.spec?.content) {
      configObject['backendConfig'] = {
        type: BackendConfigurationTypes.Inline,
        spec: {
          content: values?.spec?.configuration?.spec?.backendConfig?.spec?.content
        }
      }
    } else if (values?.spec?.configuration?.spec?.backendConfig?.spec?.store) {
      if (values?.spec?.configuration?.spec?.backendConfig?.spec?.store?.type === 'Harness') {
        configObject['backendConfig'] = { ...values?.spec?.configuration?.spec?.backendConfig }
      } else {
        if (values?.spec?.configuration?.spec?.backendConfig?.spec?.store?.spec?.connectorRef) {
          configObject['backendConfig'] = {
            type: BackendConfigurationTypes.Remote,
            ...values.spec?.configuration?.spec?.backendConfig,
            spec: {
              store: {
                ...values.spec?.configuration?.spec?.backendConfig?.spec?.store,
                type:
                  backendConfigConnectorValue?.connector?.type ||
                  values?.spec?.configuration?.spec?.backendConfig?.spec?.store?.type,
                spec: {
                  ...values.spec?.configuration?.spec?.backendConfig?.spec?.store?.spec,
                  connectorRef: values?.spec?.configuration?.spec?.backendConfig?.spec?.store?.spec?.connectorRef
                    ? getMultiTypeFromValue(
                        values?.spec?.configuration?.spec?.backendConfig?.spec?.store?.spec?.connectorRef
                      ) === MultiTypeInputType.RUNTIME || !backendConfigConnectorValue?.value
                      ? values?.spec?.configuration?.spec?.backendConfig?.spec?.store?.spec?.connectorRef
                      : backendConfigConnectorValue?.value
                    : ''
                }
              }
            }
          }
        } else {
          unset(values?.spec?.configuration?.spec, 'backendConfig')
        }
      }
    } else {
      unset(values?.spec?.configuration?.spec, 'backendConfig')
    }
    if (envMap.length) {
      configObject['environmentVariables'] = envMap
    }
    if (targetMap.length) {
      configObject['targets'] = targetMap
    } else if (getMultiTypeFromValue(values?.spec?.configuration?.spec?.targets) === MultiTypeInputType.RUNTIME) {
      configObject['targets'] = values?.spec?.configuration?.spec?.targets
    }
    if (values?.spec?.configuration?.spec?.varFiles?.length) {
      configObject['varFiles'] = values?.spec?.configuration?.spec?.varFiles
    } else {
      unset(values?.spec?.configuration?.spec, 'varFiles')
    }
    configObject['moduleConfig'] = {
      ...values.spec?.configuration?.spec?.moduleConfig
    }

    if (
      connectorValue ||
      getMultiTypeFromValue(values?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef) ===
        MultiTypeInputType.RUNTIME
    ) {
      configObject['configFiles'] = {
        ...values.spec?.configuration?.spec?.configFiles,
        store: {
          ...values.spec?.configuration?.spec?.configFiles?.store,
          type: values?.spec?.configuration?.spec?.configFiles?.store?.type,
          spec: {
            ...values.spec?.configuration?.spec?.configFiles?.store?.spec,
            connectorRef: values?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef
              ? getMultiTypeFromValue(values?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef) ===
                  MultiTypeInputType.RUNTIME || !connectorValue?.value
                ? values?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef
                : connectorValue?.value
              : ''
          }
        }
      }
    }

    if (values?.spec?.configuration?.spec?.configFiles?.store?.type === 'Harness') {
      configObject['configFiles'] = { ...values?.spec?.configuration?.spec?.configFiles }
    }
  }
  return {
    ...values,
    spec: {
      provisionerIdentifier: values.spec?.provisionerIdentifier,
      configuration: {
        type: values?.spec?.configuration?.type,
        spec: {
          ...configObject
        }
      }
    }
  }
}
