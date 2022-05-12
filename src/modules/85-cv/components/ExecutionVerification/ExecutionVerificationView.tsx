/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState, useCallback } from 'react'
import { Container, Tabs, Tab, NoDataCard, Layout, FlexExpander, Button, ButtonVariation } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import type { ExecutionNode } from 'services/pipeline-ng'
import { Connectors } from '@connectors/constants'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { useLogContentHook } from '@cv/hooks/useLogContentHook/useLogContentHook'
import { LogTypes } from '@cv/hooks/useLogContentHook/useLogContentHook.types'
import { DeploymentMetrics } from './components/DeploymentMetrics/DeploymentMetrics'
import { ExecutionVerificationSummary } from './components/ExecutionVerificationSummary/ExecutionVerificationSummary'
import type { DeploymentNodeAnalysisResult } from './components/DeploymentProgressAndNodes/components/DeploymentNodes/DeploymentNodes.constants'
import LogAnalysisContainer from './components/LogAnalysisContainer/LogAnalysisView.container'
import { getActivityId, getDefaultTabId } from './ExecutionVerificationView.utils'
import { ManualInterventionVerifyStep } from './components/ManualInterventionVerifyStep/ManualInterventionVerifyStep'
import InterruptedHistory from './components/InterruptedHistory/InterruptedHistory'
import css from './ExecutionVerificationView.module.scss'

interface ExecutionVerificationViewProps {
  step: ExecutionNode
}

export function ExecutionVerificationView(props: ExecutionVerificationViewProps): JSX.Element {
  const { step } = props
  const { getString } = useStrings()
  const [selectedNode, setSelectedNode] = useState<DeploymentNodeAnalysisResult | undefined>()
  const activityId = useMemo(() => getActivityId(step), [step])
  const { type } = useQueryParams<{ type?: string }>()
  const defaultTabId = useMemo(() => getDefaultTabId(getString, type), [type])
  const isErrorTrackingEnabled = useFeatureFlag(FeatureFlag.ERROR_TRACKING_ENABLED)

  const { openLogContentHook } = useLogContentHook({ verifyStepExecutionId: activityId })

  const handleTabChange = useCallback(() => {
    setSelectedNode(undefined)
  }, [])

  const content = activityId ? (
    <>
      <ManualInterventionVerifyStep step={step} />
      <InterruptedHistory interruptedHistories={step?.interruptHistories} />
      <Tabs id="AnalysisTypeTabs" defaultSelectedTabId={defaultTabId} onChange={handleTabChange}>
        <Tab
          id={getString('pipeline.verification.analysisTab.metrics')}
          title={getString('pipeline.verification.analysisTab.metrics')}
          panelClassName={css.mainTabPanel}
          panel={
            <Layout.Horizontal style={{ height: '100%' }}>
              <ExecutionVerificationSummary
                displayAnalysisCount={false}
                step={step}
                className={css.executionSummary}
                onSelectNode={setSelectedNode}
                isConsoleView
              />
              <DeploymentMetrics step={step} selectedNode={selectedNode} activityId={activityId} />
            </Layout.Horizontal>
          }
        />
        <Tab
          id={getString('pipeline.verification.analysisTab.logs')}
          title={getString('pipeline.verification.analysisTab.logs')}
          panel={
            <Layout.Horizontal style={{ height: '100%' }}>
              <ExecutionVerificationSummary
                displayAnalysisCount={false}
                step={step}
                className={css.executionSummary}
                onSelectNode={setSelectedNode}
                isConsoleView
              />
              <LogAnalysisContainer step={step} hostName={selectedNode?.hostName} />
            </Layout.Horizontal>
          }
          panelClassName={css.mainTabPanelLogs}
        />
        {isErrorTrackingEnabled && (
          <Tab
            id={getString('errors')}
            title={getString('errors')}
            panel={
              <LogAnalysisContainer
                step={step}
                hostName={Connectors.ERROR_TRACKING}
                isErrorTracking={isErrorTrackingEnabled}
              />
            }
          />
        )}
        <FlexExpander />
        <Layout.Horizontal>
          <Button
            icon="api-docs"
            withoutCurrentColor
            iconProps={{ color: Color.BLACK, size: 20 }}
            text={getString('cv.externalAPICalls')}
            variation={ButtonVariation.LINK}
            onClick={() => openLogContentHook(LogTypes.ApiCallLog)}
          />
          <Button
            icon="audit-trail"
            withoutCurrentColor
            iconProps={{ size: 20 }}
            text={getString('cv.executionLogs')}
            variation={ButtonVariation.LINK}
            onClick={() => openLogContentHook(LogTypes.ExecutionLog)}
          />
        </Layout.Horizontal>
      </Tabs>
    </>
  ) : (
    <Container className={css.noAnalysis}>
      <NoDataCard message={getString('pipeline.verification.logs.noAnalysis')} icon="warning-sign" />
    </Container>
  )
  return <Container className={css.main}>{content}</Container>
}
