/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Icon, PageError, NoDataCard, FlexExpander } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import noDataImage from '@cv/assets/noData.svg'
import { DependencyGraph } from '@cv/components/DependencyGraph/DependencyGraph'
import ServiceDependenciesLegend from '@cv/components/ServiceDependenciesLegend/ServiceDependenciesLegend'
import SummaryCard from './SummaryCard'
import { getDependencyGraphOptions } from '../MonitoredServiceGraphView.utils'
import type { CardViewProps } from '../ServiceDependencyGraph.types'
import css from '../ServiceDependencyGraph.module.scss'

const CardContent: React.FC<CardViewProps> = ({
  setPoint,
  loading,
  errorMessage,
  retryOnError,
  monitoredServiceDependencyData,
  ...rest
}) => {
  const { getString } = useStrings()

  if (errorMessage) {
    return <PageError message={errorMessage} onClick={retryOnError} />
  }

  if (loading && !monitoredServiceDependencyData?.nodes?.length) {
    return (
      <Container flex={{ justifyContent: 'center' }} height="100%">
        <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
      </Container>
    )
  }

  if (!monitoredServiceDependencyData?.nodes?.length) {
    return (
      <NoDataCard
        message={getString('cv.monitoredServices.noAvailableData')}
        image={noDataImage}
        containerClassName={css.noDataContainer}
      />
    )
  }

  return (
    <div className={css.dependencyGraphContainer}>
      {loading && <Icon name="steps-spinner" color={Color.GREY_400} size={30} className={css.loader} />}
      <DependencyGraph
        dependencyData={monitoredServiceDependencyData}
        options={getDependencyGraphOptions(setPoint, 380)}
        containerClassName={css.dependencyGraph}
      />
      <SummaryCard {...rest} />
      <FlexExpander />
      <ServiceDependenciesLegend margin={{ top: 'medium' }} />
    </div>
  )
}

export default CardContent
