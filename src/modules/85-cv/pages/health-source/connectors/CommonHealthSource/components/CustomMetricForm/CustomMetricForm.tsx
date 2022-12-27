/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { HealthSourceConfig } from '../../CommonHealthSource.types'
import CommonCustomMetricFormContainer from './components/CommonCustomMetricFormContainer/CommonCustomMetricFormContainerLayout/CommonCustomMetricFormContainer'
import css from '../../CommonHealthSource.module.scss'

interface CustomMetricFormProps {
  isTemplate?: boolean
  expressions?: string[]
  connectorIdentifier: string
  isConnectorRuntimeOrExpression?: boolean
  enabledRecordsAndQuery?: boolean
  healthSourceConfig: HealthSourceConfig
}

export default function CustomMetricForm(props: CustomMetricFormProps): JSX.Element {
  const {
    isTemplate,
    expressions,
    connectorIdentifier,
    isConnectorRuntimeOrExpression,
    enabledRecordsAndQuery,
    healthSourceConfig
  } = props
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="medium" className={css.main} padding="medium">
      <Layout.Vertical margin={{ bottom: 'medium' }}>
        <Text font={{ variation: FontVariation.H5 }}>
          {getString('cv.monitoringSources.prometheus.querySpecificationsAndMappings')}
        </Text>
        <Text font={{ variation: FontVariation.BODY }}>
          {getString('cv.monitoringSources.prometheus.customizeQuery')}
        </Text>
      </Layout.Vertical>

      {enabledRecordsAndQuery && (
        <CommonCustomMetricFormContainer
          connectorIdentifier={connectorIdentifier}
          isTemplate={isTemplate}
          expressions={expressions}
          isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
          healthSourceConfig={healthSourceConfig}
        />
      )}
    </Layout.Vertical>
  )
}
