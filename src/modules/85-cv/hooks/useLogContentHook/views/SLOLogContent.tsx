/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { useToaster } from '@harness/uicore'
import { getServiceLevelObjectiveLogsPromise, useGetServiceLevelObjectiveLogs } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { LogTypes, SLOLogContentProps, TimeRange } from '../useLogContentHook.types'
import ExecutionLog from './ExecutionLog/ExecutionLog'
import { downloadJson, getDateRangeShortcuts, parseResponseBody } from '../useLogContentHook.utils'
import ExternalAPICall from './ExternalAPICall/ExternalAPICall'
import { PAGE_SIZE } from '../useLogContentHook.constants'

const SLOLogContent: React.FC<SLOLogContentProps> = ({
  logType,
  identifier,
  serviceName,
  envName,
  isFullScreen,
  setIsFullScreen
}) => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [errorLogsOnly, setErrorLogsOnly] = React.useState<boolean>(false)
  const [pageNumber, setPageNumber] = React.useState(0)
  const [timeRange, setTimeRange] = React.useState<TimeRange>(getDateRangeShortcuts(getString)[0])
  const [startTime, endTime] = [timeRange.value[0].getTime(), timeRange.value[1].getTime()]

  const { data, loading, error, refetch } = useGetServiceLevelObjectiveLogs({
    identifier,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      logType,
      errorLogsOnly,
      pageNumber,
      startTime,
      endTime,
      pageSize: PAGE_SIZE
    }
  })

  /* istanbul ignore next */
  const resource = data?.resource

  const handleDownloadLogs = async (): Promise<void> => {
    const { totalItems } = resource ?? {}

    try {
      const response = await getServiceLevelObjectiveLogsPromise({
        identifier,
        queryParams: {
          accountId,
          orgIdentifier,
          projectIdentifier,
          logType,
          errorLogsOnly,
          startTime,
          endTime,
          pageSize: totalItems
        }
      })

      const content = response.resource?.content

      /* istanbul ignore else */ if (content) {
        const _content = logType === LogTypes.ApiCallLog ? parseResponseBody(content) : content
        downloadJson(JSON.stringify(_content), `SLO-${logType}`)
      }
    } catch (e) {
      /* istanbul ignore next */ showError(getErrorMessage(e))
    }
  }

  return logType === LogTypes.ExecutionLog ? (
    <ExecutionLog
      isFullScreen={isFullScreen}
      setIsFullScreen={setIsFullScreen}
      serviceName={serviceName}
      envName={envName}
      resource={resource}
      loading={loading}
      errorMessage={getErrorMessage(error)}
      refetchLogs={refetch}
      timeRange={timeRange}
      setTimeRange={setTimeRange}
      errorLogsOnly={errorLogsOnly}
      setErrorLogsOnly={setErrorLogsOnly}
      pageNumber={pageNumber}
      setPageNumber={setPageNumber}
      handleDownloadLogs={handleDownloadLogs}
    />
  ) : (
    <ExternalAPICall
      isFullScreen={isFullScreen}
      setIsFullScreen={setIsFullScreen}
      serviceName={serviceName}
      envName={envName}
      resource={resource}
      loading={loading}
      errorMessage={getErrorMessage(error)}
      refetchLogs={refetch}
      timeRange={timeRange}
      setTimeRange={setTimeRange}
      errorLogsOnly={errorLogsOnly}
      setErrorLogsOnly={setErrorLogsOnly}
      pageNumber={pageNumber}
      setPageNumber={setPageNumber}
      handleDownloadLogs={handleDownloadLogs}
    />
  )
}

export default SLOLogContent
