/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Layout, SelectOption } from '@harness/uicore'
import LogContentHeader from '../LogContentHeader/LogContentHeader'
import LogContentToolbar from '../LogContentToolbar/LogContentToolbar'
import ExternalAPICallContent from './ExternalAPICallContent'
import { isTimeRangeChanged } from '../../useLogContentHook.utils'
import { ExecutionAndAPICallLogProps, LogTypes, TimeRange } from '../../useLogContentHook.types'
import css from './ExternalAPICall.module.scss'

const ExternalAPICall: React.FC<ExecutionAndAPICallLogProps> = props => {
  const {
    isFullScreen,
    setIsFullScreen,
    verifyStepExecutionId,
    monitoredServiceIdentifier,
    serviceName,
    envName,
    healthSource,
    setHealthSource,
    timeRange,
    setTimeRange,
    errorLogsOnly,
    setErrorLogsOnly,
    setPageNumber,
    resource,
    handleDownloadLogs
  } = props

  const handleHealthSource = (_healthSource: SelectOption): void => {
    if (_healthSource.value !== healthSource?.value) {
      setPageNumber(0)
      setHealthSource?.(_healthSource)
    }
  }

  const handleTimeRange = (newTimeRange: TimeRange): void => {
    if (isTimeRangeChanged(newTimeRange, timeRange)) {
      setPageNumber(0)
      setTimeRange?.(newTimeRange)
    }
  }

  const handleDisplayOnlyErrors = (_errorLogsOnly: boolean): void => {
    setPageNumber(0)
    setErrorLogsOnly(_errorLogsOnly)
  }

  return (
    <div>
      <LogContentHeader
        logType={LogTypes.ApiCallLog}
        verifyStepExecutionId={verifyStepExecutionId}
        serviceName={serviceName}
        envName={envName}
        healthSource={healthSource}
        handleHealthSource={handleHealthSource}
        monitoredServiceIdentifier={monitoredServiceIdentifier}
        timeRange={timeRange}
        handleTimeRange={handleTimeRange}
        errorLogsOnly={errorLogsOnly}
        handleDisplayOnlyErrors={handleDisplayOnlyErrors}
      />
      <LogContentToolbar
        logType={LogTypes.ApiCallLog}
        data={resource?.content}
        isFullScreen={isFullScreen}
        setIsFullScreen={setIsFullScreen}
        isVerifyStep={Boolean(verifyStepExecutionId)}
        timeRange={timeRange}
        isMonitoredService={Boolean(monitoredServiceIdentifier)}
        handleDownloadLogs={handleDownloadLogs}
      />
      <div className={cx(css.accordionContainer, { [css.fullScreen]: isFullScreen })}>
        <Layout.Vertical height="100%">
          <ExternalAPICallContent {...props} errorLogsOnly={errorLogsOnly} />
        </Layout.Vertical>
      </div>
    </div>
  )
}

export default ExternalAPICall
