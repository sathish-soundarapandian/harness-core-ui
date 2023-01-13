/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useCallback, useMemo } from 'react'
import { isEmpty } from 'lodash-es'
import { Container, Heading, Button, Text, Icon, PageError, Layout } from '@harness/uicore'
import { Drawer } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import type { SampleDataProps, LogAnalysisRiskAndJiraModalProps } from './LogAnalysisDetailsDrawer.types'
import { ActivityHeadingContent } from './components/ActivityHeadingContent'
import { DrawerProps } from './LogAnalysisDetailsDrawer.constants'
import getLogAnalysisLineChartOptions from '../../LogAnalysisLineChartConfig'
import css from './LogAnalysisDetailsDrawer.module.scss'

export function SampleData(props: SampleDataProps): JSX.Element {
  const { logMessage } = props
  const { getString } = useStrings()
  return (
    <Container className={css.logMessageContainer}>
      <Text color={Color.BLACK} className={css.sampleEvent}>
        {getString('pipeline.verification.logs.sampleEvent')}
      </Text>
      <Text className={css.logMessage} tooltipProps={{ isOpen: false }} padding={{ top: 'small' }}>
        {logMessage}
      </Text>
    </Container>
  )
}

export function LogAnalysisDetailsDrawer(props: LogAnalysisRiskAndJiraModalProps): JSX.Element {
  const { onHide, rowData, isDataLoading, logsError, retryLogsCall } = props
  const [isOpen, setOpen] = useState(true)

  const { messageFrequency, count = 0, clusterType: activityType, message } = rowData

  const trendData = useMemo(() => getLogAnalysisLineChartOptions(messageFrequency || []), [messageFrequency])

  const { getString } = useStrings()
  const onHideCallback = useCallback(() => {
    setOpen(false)
    onHide()
  }, [onHide])

  /* ===============================================
     COMMENTED CODES WILL BE ADDED IN NEXT SPRINT
    ============================================== */

  // const { openEventPreferenceEditModal, closeEventPreferenceEditModal } = useEventPreferenceUpdateModal({
  //   initialModalValue: {
  //     activityType
  //   },
  //   onSubmitOfEventPreferenceEdit
  // })

  // function onSubmitOfEventPreferenceEdit(values: EventPreferenceForm): void {
  //   closeEventPreferenceEditModal()
  // }

  const getDrawerContent = (): JSX.Element => {
    if (isDataLoading) {
      return (
        <Container className={css.messageContainer} data-testid="LogAnalysisRiskAndJiraModal_loader">
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      )
    }

    if (logsError && isEmpty(rowData)) {
      return (
        <Container className={css.messageContainer} data-testid="LogAnalysisRiskAndJiraModal_error">
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
          {/* <Button variation={ButtonVariation.SECONDARY} onClick={() => openEventPreferenceEditModal()}>
      {getString('pipeline.verification.logs.updateEventPreference')}
    </Button> */}
        </Container>
        <Container className={css.formAndMessageContainer}>
          {/* <Container margin={{ bottom: 'small' }}>
      <UpdatedEventPreference />
    </Container> */}
          <Layout.Horizontal height="100%">
            <Container className={css.chartSection}>
              <ActivityHeadingContent activityType={activityType} trendData={trendData} count={count} />
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
