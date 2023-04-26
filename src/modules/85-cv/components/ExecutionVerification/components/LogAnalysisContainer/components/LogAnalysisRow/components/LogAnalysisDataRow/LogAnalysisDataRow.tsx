import React, { useCallback } from 'react'
import { Container, Text, Layout } from '@harness/uicore'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import ContextMenuActions from '@cv/components/ContextMenuActions/ContextMenuActions'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { getEventTypeColor, getEventTypeLightColor } from '@cv/utils/CommonUtils'
import LogAnalysisRowContextMenu from './components/LogAnalysisRowContextMenu'
import type { LogAnalysisDataRowProps } from '../../LogAnalysisRow.types'
import { getEventTypeFromClusterType, onClickErrorTrackingRow } from '../../LogAnalysisRow.utils'
import LogAnalysisRiskDisplay from './components/LogAnalysisRiskDisplay'
import { getContextMenuItems, getDisplayMessage } from './LogAnalysisDataRow.utils'
import { LogAnalysisRowMetadata } from './components/LogAnalysisRowMetadata'
import css from '../../LogAnalysisRow.module.scss'

export default function LogAnalysisDataRow(props: LogAnalysisDataRowProps): JSX.Element | null {
  const { rowData, isErrorTracking, onDrawOpen, index, onUpdateEventPreferenceDrawer, onJiraModalOpen } = props

  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const onShowRiskEditModalCallback = useCallback(() => {
    if (isErrorTracking) {
      onClickErrorTrackingRow(rowData.message, accountId, projectIdentifier, orgIdentifier)
    } else {
      onDrawOpen(index)
    }
  }, [isErrorTracking, rowData.message, accountId, projectIdentifier, orgIdentifier, index, onDrawOpen])

  const isLogFeedbackEnabled = useFeatureFlag(FeatureFlag.SRM_LOG_FEEDBACK_ENABLE_UI)

  const isJiraCreationEnabled = useFeatureFlag(FeatureFlag.SRM_ENABLE_JIRA_INTEGRATION)

  if (isEmpty(rowData)) {
    return null
  }

  const { feedbackApplied, riskStatus, clusterType, message, feedback } = rowData

  const isFeedbackApplied = Boolean(feedbackApplied)

  const feedbackTicketId = feedback?.ticket?.id

  const contextMenuItems = getContextMenuItems({
    feedback,
    feedbackApplied,
    getString,
    isJiraCreationEnabled,
    isLogFeedbackEnabled,
    onJiraModalOpen,
    onUpdateEventPreferenceDrawer,
    selectedIndex: index,
    onLogDetailsOpen: onDrawOpen
  })

  const isFeedbackTicketPresent = Boolean(feedbackTicketId)

  const displayMessage = getDisplayMessage(message, isErrorTracking)

  return (
    <Layout.Vertical className={css.rowContainer}>
      <Container className={css.mainRow}>
        <Container className={css.actionRow} onClick={onShowRiskEditModalCallback} data-testid={'logs-data-row'}>
          <LogAnalysisRiskDisplay risk={riskStatus} feedback={feedbackApplied} />

          <Container padding={{ left: 'small' }} className={cx(css.openModalColumn, css.compareDataColumn)}>
            {clusterType && (
              <Text
                className={css.eventTypeTag}
                font="xsmall"
                style={{
                  color: getEventTypeColor(clusterType),
                  background: getEventTypeLightColor(clusterType)
                }}
              >
                {getEventTypeFromClusterType(clusterType, getString)}
              </Text>
            )}
          </Container>
          <Container className={cx(css.logText, css.openModalColumn)}>
            <Text className={css.logRowText}>{displayMessage}</Text>
          </Container>
        </Container>

        <Layout.Horizontal margin={{ top: 'xsmall' }} style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
          <ContextMenuActions otherMenuItems={<LogAnalysisRowContextMenu menuItems={contextMenuItems} />} />
        </Layout.Horizontal>
      </Container>
      <LogAnalysisRowMetadata
        isFeedbackApplied={isFeedbackApplied}
        isFeedbackTicketPresent={isFeedbackTicketPresent}
        feedbackApplied={feedbackApplied}
        ticketDetails={feedback?.ticket}
      />
    </Layout.Vertical>
  )
}
