import React from 'react'

import { Container, Layout, Text } from '@harness/uicore'

import { useStrings } from 'framework/strings'

import { useServiceOverridesContext } from '@cd/components/ServiceOverrides/context/ServiceOverrideContext'
import {
  ApplicationSettingsOverrideDetails,
  ConfigFileOverrideDetails,
  ConnectionStringsOverrideDetails,
  ManifestOverrideDetails,
  OverrideTypes,
  ServiceOverrideRowProps,
  VariableOverrideDetails,
  rowConfigMap
} from '@cd/components/ServiceOverrides/ServiceOverridesUtils'

import VariableOverrideInfo from './VariableOverrideInfo'
import RowActionButtons from './RowActionButtons'
import ManifestOverrideInfo from './ManifestOverrideInfo'
import ConfigFileOverrideInfo from './ConfigFileOverrideInfo'
import ApplicationSettingOverrideInfo from './ApplicationSettingOverrideInfo'
import ConnectionStringOverrideInfo from './ConnectionStringOverrideInfo'

export default function ViewOnlyRow({
  rowIndex,
  overrideDetails
}: Pick<Required<ServiceOverrideRowProps>, 'rowIndex' | 'overrideDetails'>): React.ReactElement | null {
  const { getString } = useStrings()
  const { serviceOverrideType } = useServiceOverridesContext()
  const rowConfigs = rowConfigMap[serviceOverrideType]

  const { overrideType } = overrideDetails

  return (
    <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
      {rowConfigs.map(rowConfig => {
        if (rowConfig.accessKey) {
          return (
            <Container width={rowConfig.rowWidth}>
              <Text lineClamp={1}>
                {rowConfig.mapper
                  ? getString(rowConfig.mapper[overrideDetails[rowConfig.accessKey] as string])
                  : overrideDetails[rowConfig.accessKey]}
              </Text>
            </Container>
          )
        } else {
          return (
            <Layout.Horizontal
              flex={{ justifyContent: 'space-between' }}
              border={{ left: true }}
              padding={{ left: 'medium' }}
              style={{ flexGrow: 1 }}
            >
              {overrideType === OverrideTypes.VARIABLE && (
                <VariableOverrideInfo {...(overrideDetails as VariableOverrideDetails).variableValue} />
              )}
              {overrideType === OverrideTypes.MANIFEST && (
                <ManifestOverrideInfo {...(overrideDetails as ManifestOverrideDetails).manifestValue} />
              )}
              {overrideType === OverrideTypes.CONFIG && (
                <ConfigFileOverrideInfo {...(overrideDetails as ConfigFileOverrideDetails).configFileValue} />
              )}
              {overrideType === OverrideTypes.APPLICATIONSETTING && (
                <ApplicationSettingOverrideInfo
                  {...(overrideDetails as ApplicationSettingsOverrideDetails).applicationSettingsValue}
                />
              )}
              {overrideType === OverrideTypes.CONNECTIONSTRING && (
                <ConnectionStringOverrideInfo
                  {...(overrideDetails as ConnectionStringsOverrideDetails).connectionStringsValue}
                />
              )}
              <RowActionButtons rowIndex={rowIndex} />
            </Layout.Horizontal>
          )
        }
      })}
    </Layout.Horizontal>
  )
}
