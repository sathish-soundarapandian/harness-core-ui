/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Container, Text } from '@harness/uicore'
import moment from 'moment'
import cx from 'classnames'
import type { AnalysedNodeOverview, VerificationOverview } from 'services/cv'
import { useStrings } from 'framework/strings'
import { VerificationJobType } from '@cv/constants'
import CVProgressBar from './components/CVProgressBar/CVProgressBar'
import { PrimaryAndCanaryNodes } from '../ExecutionVerificationSummary/components/PrimaryandCanaryNodes/PrimaryAndCanaryNodes'
import VerificationStatusCard from './components/VerificationStatusCard/VerificationStatusCard'
import { DurationView } from './components/DurationView/DurationView'
import TestsSummaryView from './components/TestSummaryView/TestsSummaryView'
import css from './DeploymentProgressAndNodes.module.scss'

export interface DeploymentProgressAndNodesProps {
  data: VerificationOverview | null
  onSelectNode?: (node?: AnalysedNodeOverview) => void
  className?: string
  isConsoleView?: boolean
}

export function DeploymentProgressAndNodes(props: DeploymentProgressAndNodesProps): JSX.Element {
  const { onSelectNode, className, isConsoleView, data } = props
  const { metricsAnalysis, verificationStartTimestamp, spec } = data || {}
  const { getString } = useStrings()

  const deploymentNodesData = useMemo(() => {
    if (data && spec?.analysisType !== VerificationJobType.TEST) {
      const { testNodes: after = [], controlNodes: before = [] } = data || {}
      const labelBefore = (before as AnalysedNodeOverview)?.nodeType
      const labelAfter = (after as AnalysedNodeOverview)?.nodeType

      return {
        before,
        after,
        labelBefore,
        labelAfter
      }
    }
  }, [data, spec?.analysisType])

  const baselineSummaryData = useMemo(() => {
    if (spec?.analysisType === VerificationJobType.TEST) {
      const testNodes = data?.testNodes || []
      const controlNodes = data?.controlNodes

      const currentTestName = (testNodes as AnalysedNodeOverview)?.nodes?.[0]?.deploymentTag
      const currentTestDate = (testNodes as AnalysedNodeOverview)?.nodes?.[0]?.testStartTimestamp
      const baselineTestName = (controlNodes as AnalysedNodeOverview)?.nodes?.[0]?.deploymentTag
      const baselineTestDate = (controlNodes as AnalysedNodeOverview)?.nodes?.[0]?.testStartTimestamp

      return {
        baselineTestName,
        baselineTestDate,
        currentTestName,
        currentTestDate
      }
    }
  }, [data?.controlNodes, data?.testNodes, spec?.analysisType])

  const renderContent = (): JSX.Element | undefined => {
    if (data?.verificationProgressPercentage === 0 && data?.verificationStatus === 'IN_PROGRESS') {
      return <Text className={css.waitAFew}>{getString('pipeline.verification.waitForAnalysis')}</Text>
    }

    if (deploymentNodesData) {
      return (
        <PrimaryAndCanaryNodes
          primaryNodes={(deploymentNodesData.before as AnalysedNodeOverview)?.nodes || []}
          canaryNodes={(deploymentNodesData.after as AnalysedNodeOverview)?.nodes || []}
          primaryNodeLabel={deploymentNodesData.labelBefore as string}
          canaryNodeLabel={deploymentNodesData.labelAfter as string}
          onSelectNode={onSelectNode}
          isConsoleView={isConsoleView}
        />
      )
    }

    if (baselineSummaryData) {
      return <TestsSummaryView {...baselineSummaryData} />
    }
  }

  return (
    <Container className={cx(css.main, className)}>
      {metricsAnalysis && (
        <Container
          className={cx(css.durationAndStatus, {
            [css.flexLayout]: !isConsoleView
          })}
        >
          <Container>
            <Text
              font={{ size: 'small' }}
              data-name={getString('pipeline.startedOn')}
              margin={{ top: 'xsmall', bottom: 'xsmall' }}
            >
              {getString('pipeline.startedOn')}: {moment(verificationStartTimestamp).format('MMM D, YYYY h:mm A')}
            </Text>
            <DurationView durationMs={(data?.spec?.durationInMinutes ? data?.spec?.durationInMinutes : 0) * 60000} />
          </Container>
          {metricsAnalysis && !isConsoleView && <VerificationStatusCard status={data?.verificationStatus} />}
        </Container>
      )}
      <CVProgressBar
        value={data?.verificationProgressPercentage ?? 0}
        status={data?.verificationStatus}
        className={css.progressBar}
      />
      {metricsAnalysis && isConsoleView && <VerificationStatusCard status={data?.verificationStatus} />}
      {renderContent()}
    </Container>
  )
}
