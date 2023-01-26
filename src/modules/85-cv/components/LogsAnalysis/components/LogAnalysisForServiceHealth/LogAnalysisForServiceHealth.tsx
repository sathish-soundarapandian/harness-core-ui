/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState } from 'react'
import { Container, Icon, NoDataCard, PageError } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import noDataImage from '@cv/assets/noData.svg'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import LogAnalysisRadarChartHeader from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/components/LogAnalysisRadarChartHeader'
import type { LogAnalysisProps } from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/LogAnalysis.types'
import LogAnalysisRadarChart from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/components/LogAnalysisRadarChart'
import { LogAnalysisRow } from '@cv/components/LogsAnalysis/components/LogAnalysisRow/LogAnalysisRow'
import type { LogAnalysisRowData } from './LogAnalysisForServiceHealth.types'
import { getLogAnalysisData } from './LogAnalysisForServiceHealth.utils'
import styles from './LogAnalysisForServiceHealth.module.scss'

export default function LogAnalysisForServiceHealth(props: LogAnalysisProps): JSX.Element {
  const {
    data,
    clusterChartData,
    goToPage,
    logsLoading,
    clusterChartLoading,
    isErrorTracking,
    handleAngleChange,
    filteredAngle,
    activityId,
    logsError,
    refetchLogAnalysis,
    clusterChartError,
    refetchClusterAnalysis,
    startTime,
    endTime,
    monitoredServiceIdentifier,
    isServicePage = false
  } = props
  const { getString } = useStrings()

  const logAnalysisData = useMemo((): LogAnalysisRowData[] => {
    return getLogAnalysisData(data, isServicePage)
  }, [data, isServicePage])

  const [selectedLog, setSelectedLog] = useState<string | null>(null)

  const handleLogSelection = useCallback((logClusterId: string): void => {
    setSelectedLog(logClusterId)
  }, [])

  const resetSelectedLog = useCallback(() => {
    setSelectedLog(null)
  }, [])

  const renderLogsData = useCallback(() => {
    if (logsLoading) {
      return (
        <Container data-testid="logAnalysisForServiceHealth-loadingLogs" className={styles.loading}>
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      )
    } else if (logsError) {
      return (
        <Container data-testid="LogAnalysisList_error">
          <PageError message={getErrorMessage(logsError)} onClick={refetchLogAnalysis} className={styles.noData} />
        </Container>
      )

      // adding clusterChartLoading here inorder to prevent this visible before cluster chart loads
      // this prevents showing two no data text and then change to one
    } else if (!logAnalysisData.length && !clusterChartLoading) {
      return (
        <Container className={styles.noData} data-testid="LogAnalysisList_NoData">
          <NoDataCard message={getString('cv.monitoredServices.noMatchingData')} image={noDataImage} />
        </Container>
      )
    } else {
      return (
        <LogAnalysisRow
          className={styles.logAnalysisRow}
          data={logAnalysisData}
          isErrorTracking={isErrorTracking}
          logResourceData={data?.resource?.logAnalysisRadarCharts}
          goToPage={goToPage}
          selectedLog={selectedLog}
          resetSelectedLog={resetSelectedLog}
          activityId={activityId}
          isServicePage={isServicePage}
          startTime={startTime}
          endTime={endTime}
          monitoredServiceIdentifier={monitoredServiceIdentifier}
        />
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsLoading, logAnalysisData.length, selectedLog])

  return (
    <Container className={styles.logsTab}>
      <Container className={styles.clusterChart}>
        {!clusterChartLoading && !logsError && (
          <LogAnalysisRadarChartHeader
            totalClustersCount={data?.resource?.totalClusters}
            eventsCount={data?.resource?.eventCounts}
          />
        )}
        <LogAnalysisRadarChart
          clusterChartLoading={clusterChartLoading}
          clusterChartData={clusterChartData}
          handleAngleChange={handleAngleChange}
          filteredAngle={filteredAngle}
          onRadarPointClick={handleLogSelection}
          clusterChartError={clusterChartError}
          refetchClusterAnalysis={refetchClusterAnalysis}
          logsLoading={logsLoading}
          showBaseline={!isServicePage}
        />
      </Container>
      <Container className={styles.tableContent}>{renderLogsData()}</Container>
    </Container>
  )
}
