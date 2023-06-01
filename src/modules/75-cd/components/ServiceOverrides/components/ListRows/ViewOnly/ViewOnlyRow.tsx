import React from 'react'

import { Container, Layout } from '@harness/uicore'

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
  headerConfigMap
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
  const headerConfigs = headerConfigMap[serviceOverrideType]

  const { overrideType } = overrideDetails

  return (
    <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
      {headerConfigs.map(headerConfig => {
        if (headerConfig.accessKey) {
          return (
            <Container width={headerConfig.width}>
              {headerConfig.mapper
                ? getString(headerConfig.mapper[overrideDetails[headerConfig.accessKey] as string])
                : overrideDetails[headerConfig.accessKey]}
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
