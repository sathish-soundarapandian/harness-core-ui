/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useCallback } from 'react'
import { isEmpty } from 'lodash-es'
import { Container, Heading, Button, Text, Icon, PageError, Layout, ButtonVariation } from '@harness/uicore'
import { Drawer } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { useStrings } from 'framework/strings'
import type { SampleDataProps, LogAnalysisDetailsDrawerProps } from './LogAnalysisDetailsDrawer.types'
import { ActivityHeadingContent } from './components/ActivityHeadingContent'
import { DrawerProps } from './LogAnalysisDetailsDrawer.constants'
import css from './LogAnalysisDetailsDrawer.module.scss'

export function SampleData(props: SampleDataProps): JSX.Element {
  const { logMessage } = props
  const { getString } = useStrings()
  return (
    <Container className={css.logMessageContainer}>
      <Text color={Color.BLACK} className={css.sampleEvent}>
        {getString('pipeline.verification.logs.sampleEvent')}
      </Text>
      <Text className={css.logMessage} lineClamp={30} tooltipProps={{ isOpen: false }} padding={{ top: 'small' }}>
        {logMessage}
      </Text>
    </Container>
  )
}

export function LogAnalysisDetailsDrawer(props: LogAnalysisDetailsDrawerProps): JSX.Element {
  const { onHide, rowData, isDataLoading, logsError, retryLogsCall, onUpdatePreferenceDrawerOpen, index } = props
  const [isOpen, setOpen] = useState(true)

  const isLogFeedbackEnabled = useFeatureFlag(FeatureFlag.SRM_LOG_FEEDBACK_ENABLE_UI)

  const {
    messageFrequency,
    count = 0,
    clusterType: activityType,
    message,
    riskStatus,
    feedback,
    feedbackApplied
  } = rowData

  const { getString } = useStrings()
  const onHideCallback = useCallback(() => {
    setOpen(false)
    onHide()
  }, [onHide])

  const getDrawerContent = (): JSX.Element => {
    if (isDataLoading) {
      return (
        <Container className={css.messageContainer} data-testid="LogAnalysisDetailsDrawer_loader">
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      )
    }

    if (logsError && isEmpty(rowData)) {
      return (
        <Container className={css.messageContainer} data-testid="LogAnalysisDetailsDrawer_error">
          <PageError message={getErrorMessage(logsError)} onClick={retryLogsCall} />
        </Container>
      )
    }

    return (
      <>
        <Container className={css.headingContainer} data-testid="LogAnalysis_detailsDrawer">
          <Heading level={2} font={{ variation: FontVariation.H4 }}>
            {getString('pipeline.verification.logs.eventDetails')}
          </Heading>
          {isLogFeedbackEnabled && (
            <Button
              variation={ButtonVariation.SECONDARY}
              onClick={() =>
                onUpdatePreferenceDrawerOpen({ selectedIndex: index ?? 0, isOpenedViaLogsDrawer: true, rowData })
              }
              data-testid="updateEventPreferenceButton-Drawer"
            >
              {getString('pipeline.verification.logs.updateEventPreference')}
            </Button>
          )}
        </Container>

        <Container className={css.formAndMessageContainer}>
          <Layout.Horizontal height="100%">
            <Container className={css.chartSection}>
              <ActivityHeadingContent
                activityType={activityType}
                riskStatus={riskStatus}
                messageFrequency={messageFrequency}
                count={count}
                feedback={feedback}
                feedbackApplied={feedbackApplied}
              />
            </Container>
            <Container className={css.sampleMessageSection}>
              <SampleData logMessage={message} />
            </Container>
          </Layout.Horizontal>
        </Container>
      </>
    )
  }

  return (
    <>
      <Drawer {...DrawerProps} isOpen={isOpen} onClose={onHideCallback} className={css.main}>
        {getDrawerContent()}
      </Drawer>
      <Button
        data-testid="DrawerClose_button"
        minimal
        className={css.almostFullScreenCloseBtn}
        icon="cross"
        withoutBoxShadow
        onClick={onHideCallback}
      />
    </>
  )
}
