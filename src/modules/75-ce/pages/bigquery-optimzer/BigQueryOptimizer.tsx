import React from 'react'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import SummaryWidget from './SummaryWidget'
import BigQueryTable from './BigQueryTable'
import BigQueryChartContainer from './BigQueryChartContainer'

const BigQueryOptimizer = () => {
  return (
    <>
      <Page.Header title={'Big Query Optimizer'} breadcrumbs={<NGBreadcrumbs />} />
      <Page.Body>
        <SummaryWidget />
        <BigQueryChartContainer />
      </Page.Body>
    </>
  )
}

export default BigQueryOptimizer
