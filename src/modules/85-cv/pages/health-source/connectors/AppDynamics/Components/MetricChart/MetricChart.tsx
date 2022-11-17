/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useCallback } from 'react'
import { debounce } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Container } from '@harness/uicore'
import type { GetDataError } from 'restful-react'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetAppdynamicsMetricDataByPathV2 } from 'services/cv'
import MetricLineChart from '@cv/pages/health-source/common/MetricLineChart/MetricLineChart'

export default function MetricChart({
  connectorIdentifier,
  appName,
  completeMetricPath
}: {
  connectorIdentifier: string
  appName: string
  completeMetricPath: string
}): JSX.Element {
  const {
    data: v2Data,
    refetch: v2Refetch,
    loading: v2Loading,
    error: v2Error
  } = useGetAppdynamicsMetricDataByPathV2({ lazy: true })
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const debounceRefetch = useCallback(debounce(v2Refetch, 500), [])

  useEffect(() => {
    if (completeMetricPath) {
      debounceRefetch({
        queryParams: {
          accountId,
          orgIdentifier,
          projectIdentifier,
          connectorIdentifier,
          appName,
          completeMetricPath
        }
      })
    }
  }, [appName, completeMetricPath, connectorIdentifier])

  const dataPoints = v2Data?.data?.dataPoints
  const options: any[] = []
  dataPoints?.forEach((point: any) => {
    options.push([point?.timestamp * 1000, point?.value])
  })

  return (
    <Container>
      <MetricLineChart options={options} loading={v2Loading} error={v2Error as GetDataError<Error>} />
    </Container>
  )
}
