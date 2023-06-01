import React, { useCallback } from 'react'
import { useFormikContext } from 'formik'

import { FormInput, MultiTypeInputType } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import type {
  ApplicationSettingsConfiguration,
  ConfigFileWrapper,
  ConnectionStringsConfiguration,
  ManifestConfigWrapper
} from 'services/cd-ng'

import { OverrideTypes, overridesLabelStringMap } from '@cd/components/ServiceOverrides/ServiceOverridesUtils'
import { useServiceOverridesContext } from '@cd/components/ServiceOverrides/context/ServiceOverrideContext'
import useServiceManifestOverride from './useManifestOverride'
import useConfigFileOverride from './useConfigFileOverride'
import useApplicationSettingOverride from './useApplicationSettingOverride'
import useConnectionStringOverride from './useConnectionStringOverride'

export default function OverrideTypeInput(): React.ReactElement {
  const { getString } = useStrings()
  const { setFieldValue, submitForm } = useFormikContext()
  const { serviceOverrideType } = useServiceOverridesContext()

  const handleOverrideSubmit = useCallback(
    (
      overrideObj:
        | ManifestConfigWrapper
        | ConfigFileWrapper
        | ApplicationSettingsConfiguration
        | ConnectionStringsConfiguration,
      type: string
    ): void => {
      switch (type) {
        case 'applicationSettings':
        case 'connectionStrings':
          setFieldValue(type, overrideObj)
          break
        default:
          setFieldValue(`${type}.0`, overrideObj)
      }
      setTimeout(() => {
        submitForm()
      }, 150)
    },
    []
  )

  const { createNewManifestOverride } = useServiceManifestOverride({
    manifestOverrides: [],
    isReadonly: false,
    handleManifestOverrideSubmit: manifestObj => handleOverrideSubmit(manifestObj, 'manifests'),
    fromEnvConfigPage: true,
    expressions: [],
    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
  })

  const { createNewFileOverride } = useConfigFileOverride({
    fileOverrides: [],
    isReadonly: false,
    fromEnvConfigPage: true,
    handleConfigFileOverrideSubmit: filesObj => handleOverrideSubmit(filesObj, 'configFiles'),
    expressions: [],
    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
  })

  const { showConnectorModal } = useApplicationSettingOverride({
    isReadonly: false,
    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
    handleSubmitConfig: config => handleOverrideSubmit(config, 'applicationSettings')
  })

  const { showConnectorModal2 } = useConnectionStringOverride({
    isReadonly: false,
    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
    handleSubmitConfig: config => handleOverrideSubmit(config, 'connectionStrings')
  })

  return (
    <FormInput.Select
      name="overrideType"
      items={[
        {
          label: getString(overridesLabelStringMap[OverrideTypes.VARIABLE]),
          value: OverrideTypes.VARIABLE
        },
        {
          label: getString(overridesLabelStringMap[OverrideTypes.MANIFEST]),
          value: OverrideTypes.MANIFEST
        },
        { label: getString(overridesLabelStringMap[OverrideTypes.CONFIG]), value: OverrideTypes.CONFIG },
        ...(serviceOverrideType === 'ENV_GLOBAL_OVERRIDE'
          ? [
              {
                label: getString(overridesLabelStringMap[OverrideTypes.APPLICATIONSETTING]),
                value: OverrideTypes.APPLICATIONSETTING
              },
              {
                label: getString(overridesLabelStringMap[OverrideTypes.CONNECTIONSTRING]),
                value: OverrideTypes.CONNECTIONSTRING
              }
            ]
          : [])
      ]}
      onChange={item => {
        if (item.value === OverrideTypes.MANIFEST) {
          createNewManifestOverride()
        } else if (item.value === OverrideTypes.CONFIG) {
          createNewFileOverride()
        } else if (item.value === OverrideTypes.APPLICATIONSETTING) {
          showConnectorModal()
        } else if (item.value === OverrideTypes.CONNECTIONSTRING) {
          showConnectorModal2()
        }
      }}
    />
  )
}
