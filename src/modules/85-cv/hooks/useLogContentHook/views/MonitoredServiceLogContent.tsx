/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import type { SelectOption} from '@harness/uicore';
import { useToaster } from '@harness/uicore'
import { getMonitoredServiceLogsPromise, useGetMonitoredServiceLogs } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { MonitoredServiceLogContentProps } from '../useLogContentHook.types';
import { LogTypes } from '../useLogContentHook.types'
import ExecutionLog from './ExecutionLog/ExecutionLog'
import ExternalAPICall from './ExternalAPICall/ExternalAPICall'
import { PAGE_SIZE } from '../useLogContentHook.constants'
import { downloadJson, parseResponseBody } from '../useLogContentHook.utils'

const MonitoredServiceLogContent: React.FC<MonitoredServiceLogContentProps> = ({
  logType,
  isFullScreen,
  setIsFullScreen,
  monitoredServiceIdentifier,
  serviceName,
  envName,
  startTime = 0,
  endTime = 0,
  showTimelineSlider
}) => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()
  const [healthSource, setHealthSource] = React.useState<SelectOption>({ label: getString('all'), value: '' })
  const [errorLogsOnly, setErrorLogsOnly] = React.useState<boolean>(false)
  const [pageNumber, setPageNumber] = React.useState(0)

  const { data, loading, error, refetch } = useGetMonitoredServiceLogs({
    monitoredServiceIdentifier,
    queryParams: {
      accountId,
      pageSize: PAGE_SIZE,
      logType,
      pageNumber,
      errorLogsOnly,
      startTime,
      endTime,
      orgIdentifier,
      projectIdentifier,
      ...(healthSource.value ? { healthSources: [healthSource.value as string] } : {})
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  const handleDownloadLogs = async (): Promise<void> => {
    /* istanbul ignore next */
    const { totalItems } = resource ?? {}

    try {
      const response = await getMonitoredServiceLogsPromise({
        monitoredServiceIdentifier,
        queryParams: {
          accountId,
          orgIdentifier,
          projectIdentifier,
          logType,
          errorLogsOnly,
          startTime,
          endTime,
          pageSize: totalItems,
          ...(healthSource.value ? { healthSources: [healthSource.value as string] } : {})
        }
      })

      const content = response.resource?.content

      /* istanbul ignore else */ if (content) {
        const _content = logType === LogTypes.ApiCallLog ? parseResponseBody(content) : content
        downloadJson(JSON.stringify(_content), `MonitoredService-${logType}`)
      }
    } catch (e) {
      /* istanbul ignore next */ showError(getErrorMessage(e))
    }
  }

  /* istanbul ignore next */
  const resource = data?.resource

  return logType === LogTypes.ExecutionLog ? (
    <ExecutionLog
      isFullScreen={isFullScreen}
      setIsFullScreen={setIsFullScreen}
      monitoredServiceIdentifier={monitoredServiceIdentifier}
      serviceName={serviceName}
      envName={envName}
      resource={resource}
      loading={loading}
      errorMessage={getErrorMessage(error)}
      refetchLogs={refetch}
      healthSource={healthSource}
      setHealthSource={setHealthSource}
      errorLogsOnly={errorLogsOnly}
      setErrorLogsOnly={setErrorLogsOnly}
      pageNumber={pageNumber}
      showTimelineSlider={showTimelineSlider}
      setPageNumber={setPageNumber}
      handleDownloadLogs={handleDownloadLogs}
    />
  ) : (
    <ExternalAPICall
      isFullScreen={isFullScreen}
      setIsFullScreen={setIsFullScreen}
      monitoredServiceIdentifier={monitoredServiceIdentifier}
      showTimelineSlider={showTimelineSlider}
      serviceName={serviceName}
      envName={envName}
      resource={resource}
      loading={loading}
      errorMessage={getErrorMessage(error)}
      refetchLogs={refetch}
      healthSource={healthSource}
      setHealthSource={setHealthSource}
      errorLogsOnly={errorLogsOnly}
      setErrorLogsOnly={setErrorLogsOnly}
      pageNumber={pageNumber}
      setPageNumber={setPageNumber}
      handleDownloadLogs={handleDownloadLogs}
    />
  )
}

export default MonitoredServiceLogContent
