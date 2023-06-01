import { defaultTo, isEmpty, isNil, omit } from 'lodash-es'
import type { ConfigFileWrapper, ManifestConfigWrapper, ServiceOverridesSpec } from 'services/cd-ng'
import type { RequiredField } from '@common/interfaces/RouteInterfaces'
import type { AllNGVariables } from '@pipeline/utils/types'
import {
  ConfigFileOverrideDetails,
  ManifestOverrideDetails,
  OverrideDetails,
  OverrideTypes,
  ServiceOverrideRowFormState,
  ServiceOverrideRowProps,
  VariableOverrideDetails,
  ServiceOverridesResponseDTOV2
} from '../ServiceOverridesUtils'

export const formGroupKey = (dataItem: ServiceOverridesResponseDTOV2): string => {
  const { environmentRef, infraIdentifier, serviceRef } = dataItem
  return `${environmentRef} - ${infraIdentifier} - ${serviceRef}`
}

export const formListRowItems = (dataItems: ServiceOverridesResponseDTOV2[]): ServiceOverrideRowProps[] => {
  const listRowItems: ServiceOverrideRowProps[] = []
  let rowIndex = 0
  dataItems.forEach(dataItem => {
    const spec = dataItem.spec
    const commonRowProps = {
      isEdit: false,
      isNew: false,
      groupKey: formGroupKey(dataItem),
      overrideResponse: dataItem
    }

    if (Array.isArray(spec?.variables)) {
      let variableIndex = 0
      ;(spec?.variables as RequiredField<AllNGVariables, 'name' | 'type'>[]).forEach(variable => {
        listRowItems.push({
          ...commonRowProps,
          rowIndex,
          variableIndex,
          overrideDetails: {
            ...omit(dataItem, 'spec'),
            overrideType: OverrideTypes.VARIABLE,
            variableValue: {
              ...variable
            }
          }
        })
        variableIndex += 1
        rowIndex += 1
      })
    }

    if (Array.isArray(spec?.manifests)) {
      let manifestIndex = 0
      ;(spec?.manifests as Required<ManifestConfigWrapper>[]).forEach(manifest => {
        listRowItems.push({
          ...commonRowProps,
          rowIndex,
          manifestIndex,
          overrideDetails: {
            ...omit(dataItem, 'spec'),
            overrideType: OverrideTypes.MANIFEST,
            manifestValue: {
              ...manifest
            }
          }
        })
        manifestIndex += 1
        rowIndex += 1
      })
    }

    if (Array.isArray(spec?.configFiles)) {
      let configFileIndex = 0
      ;(spec?.configFiles as Required<ConfigFileWrapper>[]).forEach(configFile => {
        listRowItems.push({
          ...commonRowProps,
          rowIndex,
          configFileIndex,
          overrideDetails: {
            ...omit(dataItem, 'spec'),
            overrideType: OverrideTypes.CONFIG,
            configFileValue: {
              ...configFile
            }
          }
        })
        configFileIndex += 1
        rowIndex += 1
      })
    }

    if (spec?.applicationSettings && !isEmpty(spec?.applicationSettings)) {
      listRowItems.push({
        ...commonRowProps,
        rowIndex,
        overrideDetails: {
          ...omit(dataItem, 'spec'),
          overrideType: OverrideTypes.APPLICATIONSETTING,
          applicationSettingsValue: {
            ...spec.applicationSettings
          }
        }
      })
      rowIndex += 1
    }

    if (spec?.connectionStrings && !isEmpty(spec?.connectionStrings)) {
      listRowItems.push({
        ...commonRowProps,
        rowIndex,
        overrideDetails: {
          ...omit(dataItem, 'spec'),
          overrideType: OverrideTypes.CONNECTIONSTRING,
          connectionStringsValue: {
            ...spec.connectionStrings
          }
        }
      })
      rowIndex += 1
    }

    return { ...commonRowProps }
  })

  return listRowItems
}

export const shouldDeleteOverrideCompletely = (overrideResponse: ServiceOverridesResponseDTOV2): boolean => {
  const {
    variables = [],
    manifests = [],
    configFiles = [],
    applicationSettings = {},
    connectionStrings
  } = overrideResponse?.spec as Required<ServiceOverridesSpec>

  const variablesLength = defaultTo(variables, []).length
  const manifestsLength = defaultTo(manifests, []).length
  const configFilesLength = defaultTo(configFiles, []).length
  const applicationSettingsLength = !isEmpty(applicationSettings) ? 1 : 0
  const connectionStringsLength = !isEmpty(connectionStrings) ? 1 : 0

  return (
    variablesLength + manifestsLength + configFilesLength + applicationSettingsLength + connectionStringsLength === 1
  )
}

export const formDeleteOverrideResponseSpec = (
  overrideResponseSpec: ServiceOverridesSpec,
  overrideDetails: OverrideDetails
): ServiceOverridesSpec => {
  if ('variableValue' in overrideDetails) {
    overrideResponseSpec.variables = overrideResponseSpec.variables?.filter(
      variableObj => variableObj.name !== (overrideDetails as VariableOverrideDetails).variableValue.name
    )
  }

  if ('manifestValue' in overrideDetails) {
    overrideResponseSpec.manifests = overrideResponseSpec.manifests?.filter(
      manifestObj =>
        manifestObj.manifest?.identifier !==
        (overrideDetails as ManifestOverrideDetails).manifestValue.manifest.identifier
    )
  }

  if ('configFileValue' in overrideDetails) {
    overrideResponseSpec.configFiles = overrideResponseSpec.configFiles?.filter(
      configFileObj =>
        configFileObj.configFile?.identifier !==
        (overrideDetails as ConfigFileOverrideDetails).configFileValue.configFile.identifier
    )
  }

  if ('applicationSettingsValue' in overrideDetails) {
    delete overrideResponseSpec.applicationSettings
  }

  if ('connectionStringsValue' in overrideDetails) {
    delete overrideResponseSpec.connectionStrings
  }

  return overrideResponseSpec
}

export const formUpdateOverrideResponseSpec = (
  overrideResponseSpec: ServiceOverridesSpec,
  values: RequiredField<ServiceOverrideRowFormState, 'environmentRef'>,
  rowItemToUpdate: RequiredField<ServiceOverrideRowProps, 'overrideDetails'>
): ServiceOverridesSpec => {
  const { variableIndex, manifestIndex, configFileIndex } = rowItemToUpdate

  if (values.overrideType === OverrideTypes.VARIABLE && overrideResponseSpec.variables && !isNil(variableIndex)) {
    overrideResponseSpec.variables[variableIndex] = { ...values.variables?.[0] }
  }

  if (values.overrideType === OverrideTypes.MANIFEST && overrideResponseSpec.manifests && !isNil(manifestIndex)) {
    overrideResponseSpec.manifests[manifestIndex] = { ...values.manifests?.[0] }
  }

  if (values.overrideType === OverrideTypes.CONFIG && overrideResponseSpec.configFiles && !isNil(configFileIndex)) {
    overrideResponseSpec.configFiles[configFileIndex] = { ...values.configFiles?.[0] }
  }

  if (
    values.overrideType === OverrideTypes.APPLICATIONSETTING &&
    overrideResponseSpec.applicationSettings &&
    values.applicationSettings
  ) {
    overrideResponseSpec.applicationSettings = { ...values.applicationSettings }
  }

  if (
    values.overrideType === OverrideTypes.CONNECTIONSTRING &&
    overrideResponseSpec.connectionStrings &&
    values.connectionStrings
  ) {
    overrideResponseSpec.connectionStrings = { ...values.connectionStrings }
  }

  return overrideResponseSpec
}
