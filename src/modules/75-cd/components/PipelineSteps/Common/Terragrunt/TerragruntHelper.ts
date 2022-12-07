import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type {
  TerragruntConfigFilesWrapper,
  TerragruntExecutionData,
  TerragruntModuleConfig,
  TerragruntPlanExecutionData
} from 'services/cd-ng'
import type { TGFormData, TGPlanFormData } from './TerragruntInterface'

export const onSubmitTerragruntData = (values: any): TGFormData => {
  const configObject: TerragruntExecutionData = {
    configFiles: {} as TerragruntConfigFilesWrapper,
    moduleConfig: {} as TerragruntModuleConfig
  }
  if (values?.spec?.configuration?.type === 'Inline') {
    const connectorValue = values?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef as any
    if (
      connectorValue ||
      getMultiTypeFromValue(values?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef) ===
        MultiTypeInputType.RUNTIME
    ) {
      ;(configObject['configFiles'] = {
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
      }),
        (configObject['moduleConfig'] = {
          ...values.spec?.configuration?.spec?.moduleConfig
        })
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

export const onSubmitTGPlanData = (values: any): TGPlanFormData => {
  const connectorValue = values?.spec?.configuration?.configFiles?.store?.spec?.connectorRef
  const configObject: TerragruntPlanExecutionData = {
    command: values?.spec?.configuration?.command,
    configFiles: {} as TerragruntConfigFilesWrapper,
    secretManagerRef: '',
    moduleConfig: {} as TerragruntModuleConfig
  }
  if (
    connectorValue ||
    getMultiTypeFromValue(values?.spec?.configuration?.configFiles?.store?.spec?.connectorRef) ===
      MultiTypeInputType.RUNTIME
  ) {
    ;(configObject['configFiles'] = {
      ...values.spec?.configuration?.configFiles,
      store: {
        ...values.spec?.configuration?.configFiles?.store,
        type: values?.spec?.configuration?.configFiles?.store?.type,
        spec: {
          ...values.spec?.configuration?.configFiles?.store?.spec,
          connectorRef: values?.spec?.configuration?.configFiles?.store?.spec?.connectorRef
            ? getMultiTypeFromValue(values?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef) ===
                MultiTypeInputType.RUNTIME || !connectorValue?.value
              ? values?.spec?.configuration?.configFiles?.store?.spec?.connectorRef
              : connectorValue?.value
            : ''
        }
      }
    }),
      (configObject['moduleConfig'] = {
        ...values.spec?.configuration?.spec?.moduleConfig
      })
  }

  if (values?.spec?.configuration?.configFiles?.store?.type === 'Harness') {
    configObject['configFiles'] = { ...values?.spec?.configuration?.configFiles }
  }

  if (values?.spec?.configuration?.secretManagerRef) {
    configObject['secretManagerRef'] = values?.spec?.configuration?.secretManagerRef
      ? values?.spec?.configuration?.secretManagerRef
      : ''
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
