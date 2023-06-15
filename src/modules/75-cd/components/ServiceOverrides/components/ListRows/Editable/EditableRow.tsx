import React, { useCallback } from 'react'
import { useFormikContext } from 'formik'
import { isEmpty, isNil } from 'lodash-es'

import {
  AllowedTypes,
  Button,
  ButtonVariation,
  Container,
  Formik,
  FormikForm,
  Layout,
  MultiTypeInputType
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'

import type {
  ApplicationSettingsConfiguration,
  ConfigFileWrapper,
  ConnectionStringsConfiguration,
  ManifestConfigWrapper
} from 'services/cd-ng'

import type { RequiredField } from '@common/interfaces/RouteInterfaces'
import { useServiceOverridesContext } from '@cd/components/ServiceOverrides/context/ServiceOverrideContext'
import {
  ApplicationSettingsOverrideDetails,
  ConfigFileOverrideDetails,
  ConnectionStringsOverrideDetails,
  ManifestOverrideDetails,
  OverrideDetails,
  OverrideTypes,
  PartiallyRequired,
  ServiceOverrideRowFormState,
  ServiceOverrideRowProps,
  VariableOverrideDetails,
  rowConfigMap
} from '@cd/components/ServiceOverrides/ServiceOverridesUtils'
import type {
  OverrideManifestStoresTypes,
  OverrideManifestTypes
} from '@cd/components/EnvironmentsV2/EnvironmentDetails/ServiceOverrides/ServiceManifestOverride/ServiceManifestOverrideUtils'

import RowItemFromValue from './RowItemFromValue/RowItemFromValue'
import { VariableOverrideEditable } from './VariableOverrideEditable'
import RowActionButtons from './RowActionButtons'
import ManifestOverrideInfo from '../ViewOnly/ManifestOverrideInfo'
import ConfigFileOverrideInfo from '../ViewOnly/ConfigFileOverrideInfo'
import ApplicationSettingOverrideInfo from '../ViewOnly/ApplicationSettingOverrideInfo'
import ConnectionStringOverrideInfo from '../ViewOnly/ConnectionStringOverrideInfo'
import useServiceManifestOverride from './useManifestOverride'
import useConfigFileOverride from './useConfigFileOverride'
import useApplicationSettingOverride from './useApplicationSettingOverride'
import useConnectionStringOverride from './useConnectionStringOverride'

import css from '../ListRows.module.scss'

export default function EditableRow({
  rowIndex,
  overrideDetails,
  isNew,
  isEdit,
  isClone
}: PartiallyRequired<ServiceOverrideRowProps, 'rowIndex' | 'isEdit' | 'isClone'>): React.ReactElement {
  const { onAdd, onUpdate } = useServiceOverridesContext()

  const { overrideType, environmentRef, infraIdentifier, serviceRef } = overrideDetails || ({} as OverrideDetails)

  const handleSubmit = (values: ServiceOverrideRowFormState): void =>
    isNew || isClone
      ? onAdd?.(values)
      : onUpdate?.(rowIndex, values as RequiredField<ServiceOverrideRowFormState, 'environmentRef'>)

  return (
    <Formik<ServiceOverrideRowFormState>
      formName="editableServiceOverride"
      initialValues={
        isNil(overrideDetails)
          ? {}
          : {
              environmentRef,
              infraIdentifier,
              serviceRef,
              overrideType,
              variables: [{ ...(overrideDetails as VariableOverrideDetails).variableValue }],
              manifests: [{ ...(overrideDetails as ManifestOverrideDetails).manifestValue }],
              configFiles: [{ ...(overrideDetails as ConfigFileOverrideDetails).configFileValue }],
              applicationSettings: {
                ...(overrideDetails as ApplicationSettingsOverrideDetails).applicationSettingsValue
              },
              connectionStrings: { ...(overrideDetails as ConnectionStringsOverrideDetails).connectionStringsValue }
            }
      }
      onSubmit={handleSubmit}
    >
      <FormikForm>
        <EditableRowInternal overrideDetails={overrideDetails} isEdit={isEdit} isClone={isClone} />
      </FormikForm>
    </Formik>
  )
}

function EditableRowInternal({
  overrideDetails,
  isEdit,
  isClone
}: {
  isEdit: boolean
  isClone: boolean
  overrideDetails?: OverrideDetails
}): React.ReactElement {
  const { values, setFieldValue, submitForm } = useFormikContext<ServiceOverrideRowFormState>()

  const { serviceOverrideType } = useServiceOverridesContext()
  const rowConfigs = rowConfigMap[serviceOverrideType]

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

  const allowableTypes: AllowedTypes =
    serviceOverrideType === 'ENV_GLOBAL_OVERRIDE' || serviceOverrideType === 'ENV_SERVICE_OVERRIDE'
      ? [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
      : [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]

  const { editManifestOverride } = useServiceManifestOverride({
    manifestOverrides: isEdit ? [(overrideDetails as ManifestOverrideDetails).manifestValue] : [],
    isReadonly: false,
    handleManifestOverrideSubmit: manifestObj => handleOverrideSubmit(manifestObj, 'manifests'),
    fromEnvConfigPage: true,
    expressions: [],
    allowableTypes
  })

  const { editFileOverride } = useConfigFileOverride({
    fileOverrides: isEdit ? [(overrideDetails as ConfigFileOverrideDetails).configFileValue] : [],
    isReadonly: false,
    fromEnvConfigPage: true,
    handleConfigFileOverrideSubmit: filesObj => handleOverrideSubmit(filesObj, 'configFiles'),
    expressions: [],
    allowableTypes
  })

  const { editApplicationConfig } = useApplicationSettingOverride({
    applicationSettings: isEdit
      ? (overrideDetails as ApplicationSettingsOverrideDetails).applicationSettingsValue
      : undefined,
    isReadonly: false,
    allowableTypes,
    handleSubmitConfig: config => handleOverrideSubmit(config, 'applicationSettings')
  })

  const { editConnectionString } = useConnectionStringOverride({
    connectionStrings: isEdit
      ? (overrideDetails as ConnectionStringsOverrideDetails).connectionStringsValue
      : undefined,
    isReadonly: false,
    allowableTypes,
    handleSubmitConfig: config => handleOverrideSubmit(config, 'connectionStrings')
  })

  return (
    <Layout.Horizontal
      flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
      padding={{ top: 'small', bottom: 'small' }}
      className={css.editableRow}
    >
      {rowConfigs.map(rowConfig => {
        if (rowConfig.accessKey) {
          return (
            <Container width={rowConfig.rowWidth} key={rowConfig.value}>
              <RowItemFromValue value={rowConfig.value} isEdit={isEdit} isClone={isClone} />
            </Container>
          )
        } else {
          const overrideTypeValue = values.overrideType

          return (
            <Layout.Horizontal
              key={rowConfig.value}
              flex={{ justifyContent: 'space-between' }}
              width={rowConfig.rowWidth}
              spacing={'medium'}
              style={{ flexGrow: 1 }}
            >
              {overrideTypeValue === OverrideTypes.VARIABLE && <VariableOverrideEditable />}
              {overrideTypeValue === OverrideTypes.MANIFEST && isEdit && (
                <ManifestOverrideInfo {...(overrideDetails as ManifestOverrideDetails).manifestValue} />
              )}
              {overrideTypeValue === OverrideTypes.CONFIG && isEdit && (
                <ConfigFileOverrideInfo {...(overrideDetails as ConfigFileOverrideDetails).configFileValue} />
              )}
              {overrideTypeValue === OverrideTypes.APPLICATIONSETTING && isEdit && (
                <ApplicationSettingOverrideInfo
                  {...(overrideDetails as ApplicationSettingsOverrideDetails).applicationSettingsValue}
                />
              )}
              {overrideTypeValue === OverrideTypes.CONNECTIONSTRING && isEdit && (
                <ConnectionStringOverrideInfo
                  {...(overrideDetails as ConnectionStringsOverrideDetails).connectionStringsValue}
                />
              )}
              {overrideDetails && overrideTypeValue && overrideTypeValue !== OverrideTypes.VARIABLE && (
                <Button
                  icon="Edit"
                  variation={ButtonVariation.ICON}
                  font={{ variation: FontVariation.BODY1 }}
                  onClick={() => {
                    if (overrideTypeValue === OverrideTypes.MANIFEST) {
                      editManifestOverride(
                        (overrideDetails as ManifestOverrideDetails).manifestValue.manifest
                          ?.type as OverrideManifestTypes,
                        (overrideDetails as ManifestOverrideDetails).manifestValue.manifest?.spec?.store
                          ?.type as OverrideManifestStoresTypes
                      )
                    } else if (overrideTypeValue === OverrideTypes.CONFIG) {
                      editFileOverride()
                    } else if (overrideTypeValue === OverrideTypes.APPLICATIONSETTING) {
                      editApplicationConfig()
                    } else if (overrideTypeValue === OverrideTypes.CONNECTIONSTRING) {
                      editConnectionString()
                    }
                  }}
                />
              )}
              {!isEmpty(overrideTypeValue) && <RowActionButtons />}
            </Layout.Horizontal>
          )
        }
      })}
    </Layout.Horizontal>
  )
}
