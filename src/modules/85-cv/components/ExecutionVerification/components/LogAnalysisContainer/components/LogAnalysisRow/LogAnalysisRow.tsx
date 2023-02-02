/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { Container, Text } from '@harness/uicore'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import {
  LogAnalysisRadarChartListDTO,
  useGetAllRadarChartLogsData,
  useGetVerifyStepDeploymentLogAnalysisRadarChartResult
} from 'services/cv'
import { getSingleLogData } from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/LogAnalysis.utils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { LogAnalysisDetailsDrawer } from './components/LogAnalysisDetailsDrawer/LogAnalysisDetailsDrawer'
import type { LogAnalysisRowProps, CompareLogEventsInfo, LogAnalysisRowData } from './LogAnalysisRow.types'
import { getCorrectLogsData, isNoLogSelected } from './LogAnalysisRow.utils'
import LogAnalysisDataRow from './components/LogAnalysisDataRow/LogAnalysisDataRow'
import LogAnalysisPagination from './components/LogAnalysisPagination'
import css from './LogAnalysisRow.module.scss'

function ColumnHeaderRow(): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container className={cx(css.mainRow, css.columnHeader)}>
      <Text padding={{ left: 'small' }}>{getString('pipeline.verification.logs.eventType')}</Text>
      <Text>{getString('cv.sampleMessage')}</Text>
      <span />

      <span />
    </Container>
  )
}

export function LogAnalysisRow(props: LogAnalysisRowProps): JSX.Element {
  const {
    data = [],
    isErrorTracking,
    logResourceData,
    selectedLog,
    activityId,
    resetSelectedLog,
    goToPage,
    isServicePage,
    startTime,
    endTime,
    monitoredServiceIdentifier
  } = props
  const [dataToCompare] = useState<CompareLogEventsInfo[]>([])

  const [riskEditModalData, setRiskEditModalData] = useState<{
    showDrawer: boolean
    selectedRowData: LogAnalysisRowData | null
  }>({
    showDrawer: false,
    selectedRowData: null
  })

  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()

  const {
    data: verifyStepLogsData,
    loading: verifyStepLogsLoading,
    error: verifyStepLogsError,
    refetch: fetchLogAnalysisVerifyScreen
  } = useGetVerifyStepDeploymentLogAnalysisRadarChartResult({
    verifyStepExecutionId: activityId as string,
    queryParams: {
      accountId
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    lazy: true
  })

  const {
    data: serviceScreenLogsData,
    refetch: fetchLogAnalysisServiceScreen,
    loading: serviceScreenLogsLoading,
    error: serviceScreenLogsError
  } = useGetAllRadarChartLogsData({
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountId,
      startTime: startTime as number,
      endTime: endTime as number,
      monitoredServiceIdentifier
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    lazy: true
  })

  const logsDataToDrawer = useMemo(() => {
    return getCorrectLogsData({
      serviceScreenLogsData,
      verifyStepLogsData,
      serviceScreenLogsLoading,
      verifyStepLogsLoading,
      serviceScreenLogsError,
      verifyStepLogsError,
      isServicePage
    })
  }, [
    isServicePage,
    serviceScreenLogsData,
    verifyStepLogsData,
    serviceScreenLogsLoading,
    verifyStepLogsLoading,
    serviceScreenLogsError,
    verifyStepLogsError
  ])

  const { logsData, logsLoading, logsError } = logsDataToDrawer

  useEffect(() => {
    let drawerData: LogAnalysisRowData = {} as LogAnalysisRowData

    if (!logsLoading && logsData && logsData.resource?.logAnalysisRadarCharts?.content?.length) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const dataToDrawer = logsData.resource?.logAnalysisRadarCharts?.content[0]

      drawerData = getSingleLogData(dataToDrawer as LogAnalysisRadarChartListDTO)

      setRiskEditModalData({
        showDrawer: true,
        selectedRowData: drawerData
      })
    }
  }, [logsData])

  const fetchLogData = useCallback(
    queryParams => {
      if (isServicePage) {
        fetchLogAnalysisServiceScreen({
          queryParams: {
            ...queryParams,
            startTime: startTime as number,
            endTime: endTime as number,
            monitoredServiceIdentifier,
            orgIdentifier,
            projectIdentifier
          }
        })
      } else {
        fetchLogAnalysisVerifyScreen({
          queryParams
        })
      }
    },
    [fetchLogAnalysisServiceScreen, fetchLogAnalysisVerifyScreen, isServicePage]
  )

  const retryLogsCall = useCallback(() => {
    // This is callback for highcharts cluster click, so it is skipped from coverage
    /* istanbul ignore next */ fetchLogData({
      accountId,
      clusterId: selectedLog as string
    })
  }, [fetchLogData, accountId, selectedLog])

  const onDrawerHide = useCallback(() => {
    setRiskEditModalData({
      showDrawer: false,
      selectedRowData: null
    })
    resetSelectedLog?.()
  }, [])

  useEffect(() => {
    if (isNoLogSelected(selectedLog)) {
      onDrawerHide()
    } else {
      const selectedIndex = data.findIndex(log => log?.clusterId === selectedLog)

      if (selectedIndex !== -1) {
        setRiskEditModalData({
          showDrawer: true,
          selectedRowData: data[selectedIndex]
        })
      } else {
        fetchLogData({
          accountId,
          clusterId: selectedLog as string
        })
      }
    }
  }, [accountId, data, fetchLogData, onDrawerHide, selectedLog])

  useEffect(() => {
    if (logsLoading) {
      setRiskEditModalData({
        showDrawer: true,
        selectedRowData: {} as LogAnalysisRowData
      })
    }
  }, [logsLoading])

  const selectedIndices = useMemo(() => new Set(dataToCompare.map(d => d.index)), [dataToCompare])

  const onDrawerOpen = useCallback((selectedIndex: number) => {
    setRiskEditModalData({
      showDrawer: true,
      selectedRowData: data[selectedIndex]
    })
  }, [])

  return (
    <Container className={cx(css.main, props.className)}>
      <ColumnHeaderRow />
      {riskEditModalData.showDrawer ? (
        <LogAnalysisDetailsDrawer
          onHide={onDrawerHide}
          rowData={riskEditModalData.selectedRowData || ({} as LogAnalysisRowData)}
          isDataLoading={logsLoading}
          logsError={logsError}
          retryLogsCall={retryLogsCall}
        />
      ) : null}
      <Container className={css.dataContainer}>
        {data.map((row, index) => {
          if (!row || isEmpty(row)) return null
          const { clusterType, count, message } = row
          return (
            <LogAnalysisDataRow
              key={`${clusterType}-${count}-${message.substring(0, 10)}-${index}`}
              rowData={row}
              index={index}
              onDrawOpen={onDrawerOpen}
              isSelected={selectedIndices.has(index)}
              isErrorTracking={isErrorTracking}
            />
          )
        })}
      </Container>
      {logResourceData && logResourceData.totalPages && goToPage ? (
        <LogAnalysisPagination logResourceData={logResourceData} goToPage={goToPage} />
      ) : null}
    </Container>
  )
}
