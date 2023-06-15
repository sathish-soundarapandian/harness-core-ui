/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useUpdateQueryParams } from '@common/hooks'
import type { ExecutionQueryParams } from '@pipeline/utils/executionUtils'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import css from './SummaryOfDeployedNodes.module.scss'
import type { VerificationSpec } from 'services/cv'
import { VerificationJobType } from '@cv/constants'

interface SummaryOfDeployedNodesProps {
  metricsInViolation: number
  totalMetrics: number
  logClustersInViolation: number
  totalLogClusters: number
  errorClustersInViolation: number
  totalErrorClusters: number
  onClickViewDetails?: (isMetrics: boolean) => void
  analysisType?: VerificationSpec['analysisType']
}

interface SummaryTextProps {
  numerator: number
  denominator: number
  titleText: string
  tabId: string
}

function SummaryText(props: SummaryTextProps): JSX.Element {
  const { numerator, denominator, titleText, tabId } = props
  const { getString } = useStrings()
  const { updateQueryParams } = useUpdateQueryParams<ExecutionQueryParams & { type: string }>()
  return (
    <Container className={css.summaryContent}>
      <Container className={css.violations}>
        <Text intent={numerator === 0 ? 'none' : 'danger'} font={{ size: 'large', weight: 'bold' }}>
          {numerator}
        </Text>
        <Text color={Color.BLACK} className={css.outOf}>
          {getString('pipeline.outOf').toLocaleUpperCase()}
        </Text>
        <Text font={{ size: 'large', weight: 'bold' }}>{denominator}</Text>
      </Container>
      <Text color={Color.BLACK} className={css.titleText}>
        {titleText}
      </Text>
      <Text
        intent="primary"
        onClick={() => updateQueryParams({ view: 'log', type: tabId, filterAnomalous: 'true' })}
        rightIcon="arrow-right"
        className={css.viewDetails}
        data-testid={tabId}
      >
        {getString('viewDetails')}
      </Text>
    </Container>
  )
}

export function SummaryOfDeployedNodes(props: SummaryOfDeployedNodesProps): JSX.Element {
  const { metricsInViolation, totalMetrics, logClustersInViolation, totalLogClusters, analysisType } = props
  const { errorClustersInViolation, totalErrorClusters } = props
  const { getString } = useStrings()
  const isErrorTrackingEnabled = useFeatureFlag(FeatureFlag.CVNG_ENABLED)

  const isSimpleVerification = analysisType === VerificationJobType.SIMPLE

  return (
    <Container className={css.main}>
      <Text>{getString('summary').toLocaleUpperCase()}</Text>
      <hr />
      <Container className={css.summaryContainer}>
        <SummaryText
          numerator={metricsInViolation}
          denominator={totalMetrics}
          titleText={getString('pipeline.verification.metricsInViolation')}
          tabId={getString('pipeline.verification.analysisTab.metrics')}
        />
        {!isSimpleVerification && (
          <SummaryText
            numerator={logClustersInViolation}
            denominator={totalLogClusters}
            titleText={getString('pipeline.verification.logClustersInViolation')}
            tabId={getString('pipeline.verification.analysisTab.logs')}
          />
        )}
        {isErrorTrackingEnabled && !isSimpleVerification && (
          <SummaryText
            numerator={errorClustersInViolation}
            denominator={totalErrorClusters}
            titleText={getString('pipeline.verification.errorClustersInViolation')}
            tabId={getString('errors')}
          />
        )}
      </Container>
    </Container>
  )
}
