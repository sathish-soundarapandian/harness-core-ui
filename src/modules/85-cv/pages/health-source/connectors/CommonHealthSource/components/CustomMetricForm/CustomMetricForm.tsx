/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import CommonCustomMetricFormContainer from './components/CommonCustomMetricFormContainer/CommonCustomMetricFormContainerLayout/CommonCustomMetricFormContainer'
import css from '../../CommonHealthSource.module.scss'

interface CustomMetricFormProps {
  isTemplate?: boolean
  expressions?: string[]
  connectorIdentifier: string
  isConnectorRuntimeOrExpression?: boolean
  enabledRecordsAndQuery?: boolean
}

export default function CustomMetricForm(props: CustomMetricFormProps): JSX.Element {
  const { isTemplate, expressions, connectorIdentifier, isConnectorRuntimeOrExpression, enabledRecordsAndQuery } = props
  const { getString } = useStrings()

  return (
    <Container className={css.main}>
      <Layout.Vertical padding={{ left: 'medium', top: 'medium', bottom: 'small' }}>
        <Text font={{ weight: 'semi-bold', size: 'medium' }} color={Color.BLACK} padding={{ bottom: 'small' }}>
          {getString('cv.monitoringSources.prometheus.querySpecificationsAndMappings')}
        </Text>
        <Text color={Color.BLACK}>{getString('cv.monitoringSources.prometheus.customizeQuery')}</Text>
      </Layout.Vertical>
      <Layout.Vertical padding={{ left: 'medium', top: 'medium' }}>
        <Text font={{ weight: 'semi-bold', size: 'medium' }} color={Color.BLACK} padding={{ bottom: 'small' }}>
          {getString('cv.monitoringSources.commonHealthSource.defineQuery')}
        </Text>
        <Text color={Color.BLACK}>{getString('cv.monitoringSources.commonHealthSource.defineQueryDescription')}</Text>
        <Text color={Color.BLACK}>
          {getString('cv.monitoringSources.commonHealthSource.defineQuerySubDescription')}
        </Text>
      </Layout.Vertical>
      {enabledRecordsAndQuery ? (
        <CommonCustomMetricFormContainer
          connectorIdentifier={connectorIdentifier}
          isTemplate={isTemplate}
          expressions={expressions}
          isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
        />
      ) : null}
    </Container>
  )
}
