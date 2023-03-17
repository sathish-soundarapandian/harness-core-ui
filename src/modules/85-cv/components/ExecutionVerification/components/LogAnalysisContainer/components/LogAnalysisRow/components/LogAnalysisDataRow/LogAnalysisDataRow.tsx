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
import LogAnalysisRiskDisplayTooltip from './components/components/LogAnalysisRiskDisplayTooltip'
import RiskItemIndicator from '../UpdateEventPreferenceDrawer/component/component/RiskItemIndicator'
import { getDisplayMessage } from './LogAnalysisDataRow.utils'
import css from '../../LogAnalysisRow.module.scss'

export default function LogAnalysisDataRow(props: LogAnalysisDataRowProps): JSX.Element | null {
  const { rowData, isErrorTracking, onDrawOpen, index, onUpdateEventPreferenceDrawer } = props

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

  if (isEmpty(rowData)) {
    return null
  }

  const { feedbackApplied, riskStatus, clusterType, message } = rowData

  const isFeedbackApplied = Boolean(feedbackApplied)

  const contextMenuItems = [
    {
      displayText: getString('cv.logs.viewEventDetails'),
      onClick: () => onDrawOpen(index)
    }
  ]

  if (isLogFeedbackEnabled) {
    contextMenuItems.push({
      displayText: getString('pipeline.verification.logs.updateEventPreference'),
      onClick: () => onUpdateEventPreferenceDrawer({ selectedIndex: index })
    })
  }

  const displayMessage = getDisplayMessage(message, isErrorTracking)

  return (
    <Layout.Vertical className={css.rowContainer}>
      <Container
        className={cx(css.mainRow, css.dataRow)}
        onClick={onShowRiskEditModalCallback}
        data-testid={'logs-data-row'}
      >
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
          <p className={css.logRowText}>{displayMessage}</p>
        </Container>

        <Layout.Horizontal margin={{ top: 'xsmall' }} style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
          <ContextMenuActions otherMenuItems={<LogAnalysisRowContextMenu menuItems={contextMenuItems} />} />
        </Layout.Horizontal>
      </Container>
      {isFeedbackApplied && (
        <Container padding={{ left: 'medium', right: 'medium' }}>
          <Container className={css.rowAppliedFeedbackIndicator}>
            <RiskItemIndicator isSmall risk={feedbackApplied?.feedbackScore} />
            <Text
              tooltip={<LogAnalysisRiskDisplayTooltip feedback={feedbackApplied} />}
              tooltipProps={{ isDark: true }}
              className={css.rowAppliedFeedbackIndicatorText}
            >
              {getString('cv.logs.feedbackApplied')}
            </Text>
          </Container>
        </Container>
      )}
    </Layout.Vertical>
  )
}
