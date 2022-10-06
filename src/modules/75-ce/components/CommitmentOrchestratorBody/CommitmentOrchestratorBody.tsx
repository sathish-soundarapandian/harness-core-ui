/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Page } from '@harness/uicore'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { SummaryResponseData, useFetchCOSummary } from 'services/lw-co'
import PageFilterPanel from './PageFilterPanel'
import EnableBanner from './EnableBanner'
import ComputedDataWidgetsRow from './ComputedDataWidgetsRow'
import DataVisualisationContainer from './DataVisualisation/DataVisualisationContainer'
import {
  ApplyFilterOptionsProps,
  defaultTimeRangeFilter,
  FilterContext,
  FilterOptions,
  getFilterBody
} from './FilterContext'
import css from './CommitmentOrchestrationBody.module.scss'

interface CommitmentOrchestrationBodyProps {
  isActive?: boolean
}

const CommitmentOrchestrationBody: React.FC<CommitmentOrchestrationBodyProps> = ({ isActive }) => {
  const { accountId } = useParams<AccountPathProps>()
  const [filterOpts, setFilterOpts] = useState<FilterOptions>({
    timeRange: defaultTimeRangeFilter
  })
  const { timeRange, ...restFilterOpts } = filterOpts
  const [summaryData, setSummaryData] = useState<SummaryResponseData>()

  const { mutate: fetchSummary } = useFetchCOSummary({
    accountId,
    queryParams: {
      start_date: timeRange.from,
      end_date: timeRange.to,
      accountIdentifier: accountId
    }
  })

  useEffect(() => {
    fetchSummary(getFilterBody(restFilterOpts)).then(res => {
      setSummaryData(res.response)
    })
  }, [timeRange.from, timeRange.to, restFilterOpts.account, restFilterOpts.instanceFamily, restFilterOpts.region])

  /* istanbul ignore next */
  const handleFilterSelection = (opts: ApplyFilterOptionsProps) => {
    setFilterOpts({
      ...filterOpts,
      ...opts
    })
  }

  return (
    <Page.Body className={css.commitmentBody}>
      <FilterContext.Provider value={filterOpts}>
        <PageFilterPanel applyFilter={handleFilterSelection} />
        <ComputedDataWidgetsRow summaryData={summaryData} />
        {!isActive && <EnableBanner summaryData={summaryData} />}
        <DataVisualisationContainer />
      </FilterContext.Provider>
    </Page.Body>
  )
}

export default CommitmentOrchestrationBody
