/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import type { GetDataError } from 'restful-react'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetAppdynamicsMetricDataByPath, useGetAppdynamicsMetricDataByPathV2 } from 'services/cv'
import MetricLineChart from '@cv/pages/health-source/common/MetricLineChart/MetricLineChart'

export default function MetricChart({
  connectorIdentifier,
  appName,
  baseFolder,
  tier,
  metricPath,
  fullPath,
  completeMetricPath
}: {
  connectorIdentifier: string
  appName: string
  baseFolder: string
  tier: string
  metricPath: string
  fullPath?: string
  completeMetricPath: string
}): JSX.Element {
  const { data, refetch, loading, error } = useGetAppdynamicsMetricDataByPath({ lazy: true })
  const {
    data: v2Data,
    refetch: v2Refetch,
    loading: v2Loading,
    error: v2Error
  } = useGetAppdynamicsMetricDataByPathV2({ lazy: true })
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  useEffect(() => {
    const pathToArray = fullPath?.split('|').map(item => item.trim())
    const indexOfTierInPath = pathToArray?.indexOf(tier?.trim())
    refetch({
      queryParams: {
        accountId,
        orgIdentifier,
        projectIdentifier,
        connectorIdentifier,
        appName,
        tier,
        baseFolder:
          fullPath?.length && indexOfTierInPath
            ? (pathToArray?.slice(0, indexOfTierInPath).join(' | ') as string)
            : baseFolder,
        metricPath:
          fullPath?.length && indexOfTierInPath
            ? (pathToArray?.slice(indexOfTierInPath + 1).join(' | ') as string)
            : metricPath
      }
    })
  }, [metricPath, fullPath])

  useEffect(() => {
    if (completeMetricPath) {
      v2Refetch({
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
  }, [completeMetricPath])

  const dataPoints = data ? data?.data?.dataPoints : v2Data?.data?.dataPoints
  const options: any[] = []
  dataPoints?.forEach((point: any) => {
    options.push([point?.timestamp * 1000, point?.value])
  })

  return (
    <Container>
      <MetricLineChart
        options={options}
        loading={loading || v2Loading}
        error={(error || v2Error) as GetDataError<Error>}
      />
    </Container>
  )
}
