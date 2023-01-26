import React, { useCallback } from 'react'
import { Container, Text, Icon, Layout } from '@harness/uicore'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'

import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { getEventTypeColor, getEventTypeLightColor } from '@cv/utils/CommonUtils'
import type { LogAnalysisDataRowProps } from '../../LogAnalysisRow.types'
import { getEventTypeFromClusterType, onClickErrorTrackingRow } from '../../LogAnalysisRow.utils'
import css from '../../LogAnalysisRow.module.scss'

export default function LogAnalysisDataRow(props: LogAnalysisDataRowProps): JSX.Element {
  const { rowData, isErrorTracking, onDrawOpen, index } = props

  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const onShowRiskEditModalCallback = useCallback(() => {
    if (isErrorTracking) {
      onClickErrorTrackingRow(rowData.message, accountId, projectIdentifier, orgIdentifier)
    } else {
      onDrawOpen(index)
    }
  }, [isErrorTracking, rowData.message, accountId, projectIdentifier, orgIdentifier, index, onDrawOpen])

  return (
    <Container
      className={cx(css.mainRow, css.dataRow)}
      onClick={onShowRiskEditModalCallback}
      data-testid={'logs-data-row'}
    >
      <Container padding={{ left: 'small' }} className={cx(css.openModalColumn, css.compareDataColumn)}>
        {rowData.clusterType && (
          <Text
            className={css.eventTypeTag}
            font="xsmall"
            style={{
              color: getEventTypeColor(rowData.clusterType),
              background: getEventTypeLightColor(rowData.clusterType)
            }}
          >
            {getEventTypeFromClusterType(rowData.clusterType, getString)}
          </Text>
        )}
      </Container>
      <Container className={cx(css.logText, css.openModalColumn)}>
        <p className={css.logRowText}>
          {isErrorTracking ? rowData.message.split('|').slice(0, 4).join('|') : rowData.message}
        </p>
      </Container>
      <span />
      <Layout.Horizontal margin={{ top: 'xsmall' }} style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
        <Icon name="description" size={24} />
      </Layout.Horizontal>
    </Container>
  )
}
