import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useServiceOverridesContext } from '@cd/components/ServiceOverrides/context/ServiceOverrideContext'
import { headerConfigMap } from '@cd/components/ServiceOverrides/ServiceOverridesUtils'
import css from './ListHeaders.module.scss'

export default function ListHeaders(): React.ReactElement {
  const { getString } = useStrings()
  const { serviceOverrideType } = useServiceOverridesContext()
  const headerConfigs = headerConfigMap[serviceOverrideType]

  return (
    <Layout.Horizontal margin={{ top: 'large', bottom: 'medium', left: 'large' }}>
      {headerConfigs.map(headerConfig => {
        if (headerConfig.value === 'common.serviceOverrides.overrideInfo') {
          return (
            <Text
              key={headerConfig.value}
              font={{ variation: FontVariation.TABLE_HEADERS }}
              border={{ left: true }}
              padding={{ left: 'medium' }}
              className={css.overrideInfoHeader}
            >
              {getString(headerConfig.value).toUpperCase()}
            </Text>
          )
        }
        return (
          <Text key={headerConfig.value} width={headerConfig.width} font={{ variation: FontVariation.TABLE_HEADERS }}>
            {getString(headerConfig.value).toUpperCase()}
          </Text>
        )
      })}
    </Layout.Horizontal>
  )
}
