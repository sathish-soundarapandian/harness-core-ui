/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Icon, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { getRiskColorValue } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import { getIconBySourceType } from '@cv/pages/health-source/HealthSourceTable/HealthSourceTable.utils'
import { HorizontalLayout } from '@cv/pages/health-source/common/StyledComponents'
import type { MetricsAccordionPanelSummaryProps } from './MetricsAccordionPanelSummary.types'
import NodeCount from './components/NodesCount'
import { getRiskDisplayName } from './MetricsAccordionPanelSummary.utils'
import css from '../DeploymentMetricsAnalysisRow/DeploymentMetricsAnalysisRow.module.scss'

const MetricsAccordionPanelSummary: React.FC<MetricsAccordionPanelSummaryProps> = props => {
  const {
    analysisRow: { metricName, risk, transactionName, nodeRiskCount, healthSource, deeplinkURL }
  } = props
  const { healthSourceName, providerName } = healthSource || {}

  const { getString } = useStrings()
  const riskDisplayName = getRiskDisplayName(risk, getString)

  return (
    <>
      {deeplinkURL ? (
        <Container padding={{ right: 'small', left: 'small' }}>
          <a href={deeplinkURL} target="_blank" rel="noreferrer">
            {metricName}
            <span>
              <Icon name="link" height={16} width={12} padding={{ left: 'small' }} color={Color.PRIMARY_7} />
            </span>
          </a>
        </Container>
      ) : (
        <Text font={{ variation: FontVariation.BODY2_SEMI }} tooltip={metricName} margin={{ left: 'small' }}>
          {metricName}
        </Text>
      )}
      <Text font={{ variation: FontVariation.BODY2_SEMI }} tooltip={transactionName}>
        {transactionName}
      </Text>
      <Text lineClamp={1} tooltip={healthSourceName} font={{ variation: FontVariation.BODY2_SEMI }}>
        <Icon name={getIconBySourceType(providerName as string)} margin={{ right: 'small' }} size={16} />
        {healthSourceName}
      </Text>
      <Text
        font={{ variation: FontVariation.TABLE_HEADERS }}
        color={getRiskColorValue(risk, false)}
        style={{ borderColor: getRiskColorValue(risk, false) }}
        className={css.metricRisk}
      >
        {riskDisplayName}
      </Text>
      <Container>
        <NodeCount nodeRiskCount={nodeRiskCount} />
      </Container>
    </>
  )
}

export default MetricsAccordionPanelSummary
