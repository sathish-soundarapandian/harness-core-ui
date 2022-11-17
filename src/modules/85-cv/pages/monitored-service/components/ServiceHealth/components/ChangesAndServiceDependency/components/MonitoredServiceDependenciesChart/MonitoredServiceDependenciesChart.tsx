/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Icon, PageError, NoDataCard } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { DependencyGraph } from '@cv/components/DependencyGraph/DependencyGraph'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useGetServiceDependencyGraph } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import noDataImage from '@cv/assets/noData.svg'
import ServiceDependenciesLegend from '@cv/components/ServiceDependenciesLegend/ServiceDependenciesLegend'
import { getDependencyData } from '@cv/components/DependencyGraph/DependencyGraph.utils'
import type { MonitoredServiceDependenciesChartProps } from './MonitoredServiceDependenciesChart.types'
import css from './MonitoredServiceDependenciesChart.module.scss'

export default function MonitoredServiceDependenciesChart(props: MonitoredServiceDependenciesChartProps): JSX.Element {
  const { serviceIdentifier, envIdentifier } = props
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()
  const queryParams = useMemo(
    () => ({
      accountId,
      orgIdentifier,
      projectIdentifier,
      serviceIdentifier,
      environmentIdentifier: envIdentifier,
      servicesAtRiskFilter: false // Remove once made it as optional
    }),
    [accountId, envIdentifier, orgIdentifier, projectIdentifier, serviceIdentifier]
  )
  const {
    data: serviceDependencyGraphData,
    refetch: fetchServiceDependencyData,
    loading,
    error
  } = useGetServiceDependencyGraph({
    queryParams,
    lazy: true
  })

  useEffect(() => {
    if (serviceIdentifier && envIdentifier) {
      fetchServiceDependencyData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [envIdentifier, serviceIdentifier])

  const dependencyData = useMemo(() => getDependencyData(serviceDependencyGraphData), [serviceDependencyGraphData])

  const renderContent = useCallback(() => {
    if (loading) {
      return (
        <Container className={css.containerContent}>
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      )
    } else if (error) {
      return (
        <Container className={css.containerContent}>
          <PageError message={getErrorMessage(error)} onClick={() => fetchServiceDependencyData({ queryParams })} />
        </Container>
      )
    } else if (!dependencyData) {
      return (
        <Container className={css.containerContent}>
          <NoDataCard message={getString('cv.monitoredServices.noAvailableData')} image={noDataImage} />
        </Container>
      )
    } else {
      return (
        <Container padding="small">
          <DependencyGraph dependencyData={dependencyData} options={{ chart: { height: 414 } }} />
          <ServiceDependenciesLegend margin={{ top: 'small' }} />
        </Container>
      )
    }
  }, [dependencyData, error, fetchServiceDependencyData, getString, loading, queryParams])

  return <Container className={css.container}>{renderContent()}</Container>
}
