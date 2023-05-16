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
import { getVerifyStepLogsPromise, useGetVerifyStepDeploymentActivitySummary, useGetVerifyStepLogs } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { VerifyStepLogContentProps } from '../useLogContentHook.types';
import { LogTypes } from '../useLogContentHook.types'
import ExecutionLog from './ExecutionLog/ExecutionLog'
import ExternalAPICall from './ExternalAPICall/ExternalAPICall'
import { PAGE_SIZE } from '../useLogContentHook.constants'
import { downloadJson, parseResponseBody } from '../useLogContentHook.utils'

const VerifyStepLogContent: React.FC<VerifyStepLogContentProps> = ({
  logType,
  isFullScreen,
  setIsFullScreen,
  verifyStepExecutionId
}) => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { accountId } = useParams<AccountPathProps>()
  const [healthSource, setHealthSource] = React.useState<SelectOption>({ label: getString('all'), value: '' })
  const [errorLogsOnly, setErrorLogsOnly] = React.useState<boolean>(false)
  const [pageNumber, setPageNumber] = React.useState(0)

  const { data: verifyStepDeploymentActivitySummary } = useGetVerifyStepDeploymentActivitySummary({
    queryParams: { accountId },
    verifyStepExecutionId
  })

  /* istanbul ignore next */
  const { serviceName, envName } = verifyStepDeploymentActivitySummary?.resource ?? {}

  const { data, loading, error, refetch } = useGetVerifyStepLogs({
    verifyStepExecutionId,
    queryParams: {
      accountId,
      pageSize: PAGE_SIZE,
      logType,
      pageNumber,
      errorLogsOnly,
      ...(healthSource.value ? { healthSources: [healthSource.value as string] } : {})
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  /* istanbul ignore next */
  const resource = data?.resource

  const handleDownloadLogs = async (): Promise<void> => {
    const { totalItems } = resource ?? {}

    try {
      const response = await getVerifyStepLogsPromise({
        verifyStepExecutionId,
        queryParams: {
          accountId,
          pageSize: totalItems,
          logType,
          errorLogsOnly,
          ...(healthSource.value ? { healthSources: [healthSource.value as string] } : {})
        }
      })

      const content = response.resource?.content

      /* istanbul ignore else */ if (content) {
        const _content = logType === LogTypes.ApiCallLog ? parseResponseBody(content) : content
        downloadJson(JSON.stringify(_content), `VerifyStep-${logType}`)
      }
    } catch (e) {
      /* istanbul ignore next */ showError(getErrorMessage(e))
    }
  }

  return logType === LogTypes.ExecutionLog ? (
    <ExecutionLog
      isFullScreen={isFullScreen}
      setIsFullScreen={setIsFullScreen}
      verifyStepExecutionId={verifyStepExecutionId}
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
  ) : (
    <ExternalAPICall
      isFullScreen={isFullScreen}
      setIsFullScreen={setIsFullScreen}
      verifyStepExecutionId={verifyStepExecutionId}
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

export default VerifyStepLogContent
