/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Page, Layout, NoDataCard, FlexExpander } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import noServiceAvailableImage from '@cv/assets/noServiceAvailable.png'
import { DependencyGraph } from '@cv/components/DependencyGraph/DependencyGraph'
import FilterCard from '@cv/components/FilterCard/FilterCard'
import ServiceDependenciesLegend from '@cv/components/ServiceDependenciesLegend/ServiceDependenciesLegend'
import { getMonitoredServiceFilterOptions } from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService.utils'
import SummaryCard from './SummaryCard'
import type { PageViewProps, PageViewContentProps } from '../ServiceDependencyGraph.types'
import { getDependencyGraphOptions } from '../MonitoredServiceGraphView.utils'
import css from '../ServiceDependencyGraph.module.scss'

const PageViewContent: React.FC<PageViewContentProps> = ({
  point,
  setPoint,
  monitoredServiceDependencyData,
  onToggleService,
  onDeleteService
}) => {
  const { getString } = useStrings()

  if (!monitoredServiceDependencyData?.nodes?.length) {
    return (
      <NoDataCard
        image={noServiceAvailableImage}
        message={getString('cv.monitoredServices.youHaveNoMonitoredServices')}
        imageClassName={css.noServiceAvailableImage}
        containerClassName={css.noDataContainer}
      />
    )
  }

  return (
    <>
      <DependencyGraph
        dependencyData={monitoredServiceDependencyData}
        options={getDependencyGraphOptions(setPoint, '40%')}
      />
      <SummaryCard isPageView point={point} onToggleService={onToggleService} onDeleteService={onDeleteService} />
    </>
  )
}

const PageView: React.FC<PageViewProps> = ({ loading, errorMessage, retryOnError, ...rest }) => {
  const { getString } = useStrings()

  const { point, selectedFilter, onFilter, serviceCountData, createButton } = rest

  const filterOptions = getMonitoredServiceFilterOptions(getString, serviceCountData ?? null)

  return (
    <Page.Body
      loading={loading}
      error={errorMessage}
      retryOnError={retryOnError}
      noData={{
        when: () => !serviceCountData?.allServicesCount,
        image: noServiceAvailableImage,
        imageClassName: css.noServiceAvailableImage,
        message: getString('cv.monitoredServices.youHaveNoMonitoredServices'),
        button: createButton
      }}
      className={css.pageBody}
    >
      <Layout.Vertical height="100%" padding={{ top: 'medium', left: 'xlarge', right: 'xlarge', bottom: 'xlarge' }}>
        <FilterCard
          data={filterOptions}
          cardClassName={css.filterCard}
          selected={filterOptions.find(card => card.type === selectedFilter)}
          onChange={item => {
            onFilter?.(item.type)
            point?.destroySticky()
          }}
        />
        <PageViewContent {...rest} />
        <FlexExpander />
        <ServiceDependenciesLegend margin={{ top: 'medium' }} />
      </Layout.Vertical>
    </Page.Body>
  )
}

export default PageView
