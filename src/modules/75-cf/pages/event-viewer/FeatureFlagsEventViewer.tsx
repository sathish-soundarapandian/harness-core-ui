/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container } from '@harness/uicore'
import type { GetAllFeaturesQueryParams, GetFeatureMetricsQueryParams } from 'services/cf'
import { useStrings } from 'framework/strings'
import ListingPageTemplate from '@cf/components/ListingPageTemplate/ListingPageTemplate'
import { useEnvironmentSelectV2 } from '@cf/hooks/useEnvironmentSelectV2'
import { CFEnvironmentSelect } from '@cf/components/CFEnvironmentSelect/CFEnvironmentSelect'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'
import { useGovernance } from '@cf/hooks/useGovernance'
import { MetricCard } from './components/Metric'
import { StatusBar } from './components/StatusBar'
import { EventsTable, FlagEvent } from './components/EventsTable'
import { EmptyState } from './components/EmptyState'
import { DetailsModal } from './components/DetailsModal'
import { EventSourcePolyfill } from 'event-source-polyfill'
import css from './FeatureFlagsEventViewer.module.scss'
export interface MessageResponse {
  data: string
}

const FeatureFlagsEventViewer: React.FC = () => {
  const { projectIdentifier, orgIdentifier, accountId: accountIdentifier } = useParams<Record<string, string>>()
  const { activeEnvironment: environmentIdentifier } = useActiveEnvironment()
  const [openingStream, setOpeningStream] = useState(true);
  const [data, setData] = useState<Array<FlagEvent>>([])
  const [filterBy, setFilterBy] = useState('')
  const [filtered, setFiltered] = useState<Array<FlagEvent>>([])
  const [modalContent, setModalContent] = useState<string>('')
  
  const queryParams = useMemo<GetAllFeaturesQueryParams | GetFeatureMetricsQueryParams>(() => {
    return {
      projectIdentifier,
      environmentIdentifier,
      accountIdentifier,
      orgIdentifier,
      pageSize: CF_DEFAULT_PAGE_SIZE,
      metrics: false,
      flagCounts: true,
      summary: true
    }
  }, [
    projectIdentifier,
    environmentIdentifier,
    accountIdentifier,
    orgIdentifier
  ])

  const {
    EnvironmentSelect,
    loading: envsLoading,
    error: envsError,
    refetch: refetchEnvironments,
    environments,
    allEnvironmentsFlags,
    refetchAllEnvironmentsFlags
  } = useEnvironmentSelectV2({
    selectedEnvironmentIdentifier: environmentIdentifier,
    allowAllOption: true,
  })

  const { getString } = useStrings()
  const governance = useGovernance()

  const error = envsError || !!governance.governanceError

  const getUniqueFlagCount = () => {
    const set = new Set()
    data.forEach((v) => set.add(v.flagName))
    return set.size
  }

  useEffect(() => {
    if (allEnvironmentsFlags) {
      refetchAllEnvironmentsFlags()
    }

    // Open the stream
    const url = 'http://localhost:7999/api/1.0/event_viewer_stream?accountIdentifier=px7xd_BFRCi-pfWPYXVjvw&orgIdentifier=default&projectIdentifier=FFdevqa&environmentIdentifier=Production'

    if ('EventSource' in window) {
      let source = new EventSourcePolyfill(url, { withCredentials: false })
      source.addEventListener('*', (msg: any) => {
        setData((d) => {
          const newData = [...d]
          const response = JSON.parse(msg.data)
          response.time = new Date()
          response.result = (
            <span>Evaluated as <b>{response.flagValue}</b> for target <b>{response.targetName}</b></span>
          )
          newData.push(response)
          filterData(newData, filterBy)
          return newData
        })
      });

      source.addEventListener('error', function(e) {
        console.error("connection error:", e)
      }, false);

      source.addEventListener('open', function() {
        setOpeningStream(true)
        console.log("Connection Open")
      }, false);
    }
  }, [allEnvironmentsFlags, queryParams, refetchAllEnvironmentsFlags])

  const title = getString('featureFlagsEventViewerTitle')

  const filterData = (events: Array<FlagEvent>, keywords: string) => {
    setFiltered(events.filter(ev => {
      const regexp = new RegExp(keywords, 'g')
      return regexp.test(ev.flagName)
    }))
  }

  const onFilter = (keywords: string) => {
    setFilterBy(keywords)
    filterData(data, keywords)
  }

  return (
    <ListingPageTemplate
      title={title}
      headerContent={!!environments?.length && <CFEnvironmentSelect component={<EnvironmentSelect />} />}
      loading={envsLoading || !openingStream}
      error={error}
      retryOnError={() => {
        refetchEnvironments()
      }}
    >
      <Container
        padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}
        className={css.metrics}
      >
        <MetricCard total={data.length} label="Evaluated" />
        <MetricCard total={getUniqueFlagCount()} label="Seen" />
      </Container>
      <Container padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}>
        <StatusBar totalResults={data.length} totalVisibleResults={filtered.length} onFilter={onFilter} />
      </Container>
      <Container padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}>
        { data && data.length
          ? <EventsTable data={filtered} onClick={c => setModalContent(c)} />
          : <EmptyState />}
      </Container>
      <DetailsModal hideModal={() => setModalContent('')} isOpen={!!modalContent} details={modalContent}/>
    </ListingPageTemplate>
  )
}

export default FeatureFlagsEventViewer
