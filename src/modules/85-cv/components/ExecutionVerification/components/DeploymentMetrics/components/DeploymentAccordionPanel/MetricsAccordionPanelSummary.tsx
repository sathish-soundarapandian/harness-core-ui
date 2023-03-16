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
import { getIconBySourceType } from '@cv/pages/health-source/HealthSourceTable/HealthSourceTable.utils'
import type { MetricsAccordionPanelSummaryProps } from './MetricsAccordionPanelSummary.types'
import NodeCount from './components/NodesCount'
import css from '../DeploymentMetricsAnalysisRow/DeploymentMetricsAnalysisRow.module.scss'

const MetricsAccordionPanelSummary: React.FC<MetricsAccordionPanelSummaryProps> = props => {
  const {
    analysisRow: { metricName, risk, transactionName, nodeRiskCount, healthSource, deeplinkURL }
  } = props
  const { name, type } = healthSource || {}

  return (
    <>
      {deeplinkURL ? (
        <Container padding={{ right: 'medium', left: 'small' }}>
          <a href={deeplinkURL} target="_blank" rel="noreferrer">
            <Container flex={{ justifyContent: 'flex-start' }}>
              <Text lineClamp={1} color={Color.PRIMARY_7}>
                {metricName}
              </Text>
              <span>
                <Icon name="share" size={12} padding={{ left: 'small', bottom: 'xsmall' }} color={Color.PRIMARY_7} />
              </span>
            </Container>
          </a>
        </Container>
      ) : (
        <Text
          lineClamp={1}
          className={css.metricPanelLabels}
          tooltip={metricName}
          margin={{ left: 'small' }}
          padding={{ right: 'small' }}
        >
          {metricName}
        </Text>
      )}
      <Text lineClamp={1} className={css.metricPanelLabels} tooltip={transactionName} padding={{ right: 'small' }}>
        {transactionName}
      </Text>
      <Text lineClamp={1} tooltip={name} className={css.metricPanelLabels} padding={{ right: 'small' }}>
        <Icon name={getIconBySourceType(type as string)} margin={{ right: 'small' }} size={16} />
        {name}
      </Text>

      <Text
        font={{ variation: FontVariation.TABLE_HEADERS }}
        color={getRiskColorValue(risk, false)}
        style={{ borderColor: getRiskColorValue(risk, false) }}
        className={risk ? css.metricRisk : ''}
      >
        {risk}
      </Text>

      <Container>
        <NodeCount nodeRiskCount={nodeRiskCount} />
      </Container>
    </>
  )
}

export default MetricsAccordionPanelSummary
