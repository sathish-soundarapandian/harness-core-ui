/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Container, NoDataCard } from '@harness/uicore'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import {
  useGetVerifyStepDeploymentRadarChartLogAnalysisClusters,
  useGetVerifyStepDeploymentLogAnalysisRadarChartResult,
  useGetVerifyStepNodeNames,
  GetVerifyStepDeploymentRadarChartLogAnalysisClustersQueryParams
} from 'services/cv'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import noDataImage from '@cv/assets/noData.svg'
import { useQueryParams } from '@common/hooks'
import { useStrings } from 'framework/strings'
import LogAnalysis from './LogAnalysis'
import { pageSize, initialPageNumber, POLLING_INTERVAL, StepStatus, EventTypeFullName } from './LogAnalysis.constants'
import type { ClusterTypes, LogAnalysisQueryParams, MinMaxAngleState } from './LogAnalysisView.container.types'
import type { LogAnalysisContainerProps } from './LogAnalysis.types'
import { getActivityId } from '../../ExecutionVerificationView.utils'
import { getClusterTypes, getInitialNodeName } from './LogAnalysis.utils'
import { getQueryParamForHostname, getQueryParamFromFilters } from '../DeploymentMetrics/DeploymentMetrics.utils'
import { RadarChartAngleLimits } from './LogAnalysisView.container.constants'
import ClusterTypeFiltersForLogs from './components/ClusterTypeFiltersForLogs'
import css from './LogAnalysisView.container.module.scss'
import logAnalysisStyles from './LogAnalysis.module.scss'

const mockData = {
  metaData: {},
  resource: {
    totalClusters: 1,
    eventCounts: [
      {
        clusterType: 'KNOWN_EVENT',
        count: 1,
        displayName: 'Known'
      },
      {
        clusterType: 'UNEXPECTED_FREQUENCY',
        count: 0,
        displayName: 'Unexpected Frequency'
      },
      {
        clusterType: 'UNKNOWN_EVENT',
        count: 0,
        displayName: 'Unknown'
      },
      {
        clusterType: 'BASELINE',
        count: 1,
        displayName: 'Baseline'
      }
    ],
    logAnalysisRadarCharts: {
      totalPages: 1,
      totalItems: 1,
      pageItemCount: 1,
      pageSize: 10,
      content: [
        {
          message: 'test data - host1 - log1',
          clusterId: '29659f5a-f6ad-308c-97dc-d54d0ac07c1c',
          label: 0,
          risk: 'HEALTHY',
          clusterType: 'KNOWN_EVENT',
          count: 8,
          frequencyData: [1.5, 3.0, 3.0],
          hostFrequencyData: [
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 1.0
                }
              ],
              host: 'host1'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 2.0
                }
              ],
              host: 'host2'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845600,
                  count: 2.0
                },
                {
                  timeStamp: 1672845660,
                  count: 2.0
                }
              ],
              host: 'host3'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845600,
                  count: 4.0
                },
                {
                  timeStamp: 1672845660,
                  count: 4.0
                }
              ],
              host: 'host4'
            }
          ],
          testHostFrequencyData: [
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 1.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 0.0
                },
                {
                  timeStamp: 1672845660,
                  count: 0.0
                }
              ],
              host: 'host1'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 2.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 0.0
                },
                {
                  timeStamp: 1672845660,
                  count: 0.0
                }
              ],
              host: 'host2'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 0.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 2.0
                },
                {
                  timeStamp: 1672845660,
                  count: 2.0
                }
              ],
              host: 'host3'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 0.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 4.0
                },
                {
                  timeStamp: 1672845660,
                  count: 4.0
                }
              ],
              host: 'host4'
            }
          ],
          baseline: {
            message: 'test data - host1 - log1',
            label: 0,
            risk: 'NO_ANALYSIS',
            clusterType: 'BASELINE',
            count: 0,
            frequencyData: [1.5],
            hostFrequencyData: [
              {
                frequencies: [
                  {
                    timeStamp: 1672845300,
                    count: 1.0
                  }
                ],
                host: 'host1'
              },
              {
                frequencies: [
                  {
                    timeStamp: 1672845300,
                    count: 2.0
                  }
                ],
                host: 'host2'
              }
            ],
            averageFrequencyData: [
              {
                timeStamp: 1672845300,
                count: 1.5
              }
            ],
            hasControlData: false
          },
          averageFrequencyData: [
            {
              timeStamp: 1672845660,
              count: 3.0
            },
            {
              timeStamp: 1672845600,
              count: 3.0
            },
            {
              timeStamp: 1672845420,
              count: 1.5
            }
          ],
          totalTestFrequencyData: [
            {
              timeStamp: 1672845420,
              count: 3.0
            },
            {
              timeStamp: 1672845480,
              count: 0.0
            },
            {
              timeStamp: 1672845540,
              count: 0.0
            },
            {
              timeStamp: 1672845600,
              count: 6.0
            },
            {
              timeStamp: 1672845660,
              count: 6.0
            }
          ],
          averageControlFrequencyData: [
            {
              timeStamp: 1672845060,
              count: 0.0
            },
            {
              timeStamp: 1672845120,
              count: 0.0
            },
            {
              timeStamp: 1672845180,
              count: 0.0
            },
            {
              timeStamp: 1672845240,
              count: 0.0
            },
            {
              timeStamp: 1672845300,
              count: 1.5
            }
          ],
          hasControlData: true
        }
      ],
      pageIndex: 0,
      empty: false
    }
  },
  responseMessages: []
}

// 👉 Verify step screen logs
export default function LogAnalysisContainer({
  step,
  hostName,
  isErrorTracking
}: LogAnalysisContainerProps): React.ReactElement {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const pageParams = useQueryParams<LogAnalysisQueryParams>()
  const [clusterTypeFilters, setClusterTypeFilters] = useState<ClusterTypes>(() => {
    let filterValues = getClusterTypes(getString).map(i => i.value) as ClusterTypes

    if (pageParams.filterAnomalous === 'true') {
      filterValues = filterValues?.filter(clusterType => clusterType !== EventTypeFullName.KNOWN_EVENT)
    }

    return filterValues
  })

  const isMounted = useRef(false)
  const isFirstFilterCall = useRef(true)
  const [selectedHealthSource] = useState<string>()
  const [pollingIntervalId, setPollingIntervalId] = useState<any>(-1)

  const [selectedNodeName, setSelectedNodeName] = useState(getInitialNodeName(hostName))

  const [minMaxAngle, setMinMaxAngle] = useState({ min: RadarChartAngleLimits.MIN, max: RadarChartAngleLimits.MAX })

  const activityId = useMemo(() => getActivityId(step), [step])

  const [logsDataQueryParams, setLogsDataQueryParams] =
    useState<GetVerifyStepDeploymentRadarChartLogAnalysisClustersQueryParams>(() => {
      return {
        accountId,
        pageNumber: initialPageNumber,
        pageSize,
        hostNames: getQueryParamForHostname(hostName),
        minAngle: minMaxAngle.min,
        maxAngle: minMaxAngle.max,
        clusterTypes: clusterTypeFilters?.length ? clusterTypeFilters : undefined,
        healthSources: selectedHealthSource ? [selectedHealthSource] : undefined
      }
    })

  const [radarChartDataQueryParams, setradarChartDataQueryParams] =
    useState<GetVerifyStepDeploymentRadarChartLogAnalysisClustersQueryParams>(() => {
      return {
        accountId,
        hostNames: getQueryParamForHostname(hostName),
        clusterTypes: clusterTypeFilters?.length ? clusterTypeFilters : undefined,
        healthSources: selectedHealthSource ? [selectedHealthSource] : undefined
      }
    })

  const {
    data: logsData,
    loading: logsLoading,
    error: logsError,
    refetch: fetchLogAnalysis
  } = useGetVerifyStepDeploymentLogAnalysisRadarChartResult({
    verifyStepExecutionId: activityId,
    queryParams: logsDataQueryParams,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  const {
    data: clusterChartData,
    loading: clusterChartLoading,
    error: clusterChartError,
    refetch: fetchClusterAnalysis
  } = useGetVerifyStepDeploymentRadarChartLogAnalysisClusters({
    verifyStepExecutionId: activityId,
    queryParams: radarChartDataQueryParams,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  const {
    data: nodeNames,
    loading: nodeNamesLoading,
    error: nodeNamesError
  } = useGetVerifyStepNodeNames({
    verifyStepExecutionId: activityId,
    queryParams: {
      accountId
    }
  })

  const handleNodeNameChange = useCallback(selectedNodeNameFitlers => {
    setSelectedNodeName(selectedNodeNameFitlers)
  }, [])

  useEffect(() => {
    if (!isFirstFilterCall.current) {
      const nodeNameParams = selectedNodeName.map(item => item.value) as string[]

      const hostNames = getQueryParamFromFilters(nodeNameParams)

      const updatedLogsDataQueryParams = {
        ...logsDataQueryParams,
        hostNames
      }

      const updatedRadarChartDataQueryParams = {
        ...radarChartDataQueryParams,
        hostNames
      }

      setLogsDataQueryParams(updatedLogsDataQueryParams)
      setradarChartDataQueryParams(updatedRadarChartDataQueryParams)
      setMinMaxAngle({ min: RadarChartAngleLimits.MIN, max: RadarChartAngleLimits.MAX })
    }
  }, [selectedNodeName])

  useEffect(() => {
    if (!isFirstFilterCall.current) {
      const hostNames = getQueryParamForHostname(hostName)

      const updatedLogsDataQueryParams = {
        ...logsDataQueryParams,
        hostNames
      }

      const updatedRadarChartDataQueryParams = {
        ...radarChartDataQueryParams,
        hostNames
      }

      setLogsDataQueryParams(updatedLogsDataQueryParams)
      setradarChartDataQueryParams(updatedRadarChartDataQueryParams)
      setSelectedNodeName(getInitialNodeName(hostName))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostName, activityId])

  // Fetching logs and cluster data for selected cluster type
  useEffect(() => {
    if (!isFirstFilterCall.current) {
      const updatedLogsDataParams = {
        ...logsDataQueryParams,
        clusterTypes: clusterTypeFilters?.length ? clusterTypeFilters : undefined
      }

      const updatedRadarChartDataParams = {
        ...radarChartDataQueryParams,
        clusterTypes: clusterTypeFilters?.length ? clusterTypeFilters : undefined
      }

      setLogsDataQueryParams(updatedLogsDataParams)
      setradarChartDataQueryParams(updatedRadarChartDataParams)
      setMinMaxAngle({ min: RadarChartAngleLimits.MIN, max: RadarChartAngleLimits.MAX })
    } else {
      isFirstFilterCall.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterTypeFilters])

  useEffect(() => {
    if (isMounted.current) {
      setLogsDataQueryParams({
        ...logsDataQueryParams,
        minAngle: minMaxAngle.min,
        maxAngle: minMaxAngle.max
      })
    } else {
      isMounted.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minMaxAngle])

  // Polling for Logs and Cluster Chart data
  useEffect(() => {
    let intervalId = pollingIntervalId
    clearInterval(intervalId)
    if (step?.status === StepStatus.Running || step?.status === StepStatus.AsyncWaiting) {
      intervalId = setInterval(() => {
        Promise.all([
          fetchLogAnalysis({ queryParams: logsDataQueryParams }),
          fetchClusterAnalysis({ queryParams: radarChartDataQueryParams })
        ])
      }, POLLING_INTERVAL)
      setPollingIntervalId(intervalId)
    }
    return () => clearInterval(intervalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsDataQueryParams, radarChartDataQueryParams, step?.status])

  const handleClustersFilterChange = useCallback((checked: boolean, filterName: EventTypeFullName): void => {
    setClusterTypeFilters(currentFilters => {
      if (checked) {
        return [...(currentFilters as EventTypeFullName[]), filterName]
      } else {
        return currentFilters?.filter((item: string) => item !== filterName)
      }
    })
  }, [])

  const handleMinMaxChange = useCallback((updatedAngle: MinMaxAngleState): void => {
    setMinMaxAngle({ ...updatedAngle })
  }, [])

  const goToLogsPage = useCallback(
    pageNumber => {
      fetchLogAnalysis({
        queryParams: { ...logsDataQueryParams, pageNumber }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logsDataQueryParams]
  )

  const renderContent = (): JSX.Element => {
    if (
      !logsData?.resource?.logAnalysisRadarCharts?.content?.length &&
      !clusterChartData?.resource?.length &&
      !clusterChartLoading &&
      !logsLoading &&
      !logsError &&
      !clusterChartError
    ) {
      return (
        <Container className={css.noDataContainer}>
          <Container className={logAnalysisStyles.noData} data-testid="LogAnalysis_common_noData">
            <NoDataCard message={getString('cv.monitoredServices.noMatchingData')} image={noDataImage} />
          </Container>
        </Container>
      )
    }

    return (
      <LogAnalysis
        data={mockData}
        clusterChartData={clusterChartData}
        filteredAngle={minMaxAngle}
        logsLoading={logsLoading}
        logsError={logsError}
        refetchLogAnalysis={fetchLogAnalysis}
        refetchClusterAnalysis={fetchClusterAnalysis}
        clusterChartError={clusterChartError}
        clusterChartLoading={clusterChartLoading}
        goToPage={goToLogsPage}
        activityId={activityId}
        isErrorTracking={isErrorTracking}
        handleAngleChange={handleMinMaxChange}
      />
    )
  }

  return (
    <Container className={cx(css.main, { [css.logAnalysis]: !isErrorTracking })}>
      <ClusterTypeFiltersForLogs
        nodeNames={nodeNames}
        clusterTypeFilters={clusterTypeFilters}
        onFilterChange={handleClustersFilterChange}
        selectedNodeName={selectedNodeName}
        handleNodeNameChange={handleNodeNameChange}
        nodeNamesError={nodeNamesError}
        nodeNamesLoading={nodeNamesLoading}
      />
      {renderContent()}
    </Container>
  )
}
