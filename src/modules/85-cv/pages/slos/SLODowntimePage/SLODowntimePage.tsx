/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Layout, Text, NoDataCard, Container, Tabs, SelectOption } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import noDowntimeData from '@cv/assets/noDowntimeData.svg'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage, getSearchString } from '@cv/utils/CommonUtils'
import routes from '@common/RouteDefinitions'
import { useGetDowntimeAssociatedMonitoredServices, useGetHistory, useListDowntimes } from 'services/cv'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { SLODowntimeTabs } from './SLODowntimePage.types'
import { getMessageAndAddDowntimeButton, getRedirectLinks, shouldRenderNoDataCard } from './SLODowntimePage.utils'
import DowntimeList from './components/DowntimeList/DowntimeList'
import DowntimeHistory from './components/DowntimeHistory/DowntimeHistory'
import { defaultOption } from './SLODowntimePage.constants'
import { FiltersContext } from './FiltersContext'
import css from './SLODowntimePage.module.scss'

const DowntimeTabsTitle = ({ title }: { title: string }): JSX.Element => (
  <Text font={{ variation: FontVariation.LEAD }}>{title}</Text>
)

export const SLODowntimePage = (): JSX.Element => {
  const { getString } = useStrings()
  const history = useHistory()
  useDocumentTitle([getString('cv.srmTitle'), getString('cv.sloDowntime.label')])
  const { tab = SLODowntimeTabs.DOWNTIME } = useQueryParams<{ tab?: SLODowntimeTabs }>()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const pathParams = useMemo(
    () => ({ accountIdentifier: accountId, orgIdentifier, projectIdentifier }),
    [accountId, projectIdentifier, orgIdentifier]
  )

  const [monitoredServiceOption, setMonitoredServiceOption] = useState<SelectOption>(defaultOption)
  const [pageNumber, setPageNumber] = useState(0)
  const [filter, setFilter] = useState('')

  const handleCreateButton = (): void =>
    history.push(
      routes.toCVCreateSLODowntime({
        accountId,
        orgIdentifier,
        projectIdentifier
      })
    )

  const hideResetFilterButton = useMemo(() => monitoredServiceOption === defaultOption, [monitoredServiceOption])

  const queryParams = useMemo(
    () => ({
      pageNumber,
      filter,
      monitoredServiceIdentifier:
        monitoredServiceOption === defaultOption ? undefined : (monitoredServiceOption.value as string)
    }),
    [pageNumber, filter, monitoredServiceOption]
  )

  const appliedSearchAndFilter = useMemo(
    () => filter !== '' || monitoredServiceOption !== defaultOption,
    [monitoredServiceOption, filter]
  )

  const { data: monitoredServicesData, loading: monitoredServicesLoading } = useGetDowntimeAssociatedMonitoredServices({
    ...pathParams,
    queryParams: { pageSize: 100 }
  })

  const {
    data: downtimeData,
    refetch: refetchDowntimes,
    loading: downtimeDataLoading,
    error: downtimeError
  } = useListDowntimes({ ...pathParams, queryParams, lazy: true })

  const {
    data: downtimeHistoryData,
    refetch: refetchHistoryData,
    loading: downtimeHistoryLoading,
    error: downtimeHistoryError
  } = useGetHistory({ ...pathParams, queryParams, lazy: true })

  useEffect(() => {
    if (tab === SLODowntimeTabs.DOWNTIME) {
      refetchDowntimes({ ...pathParams, queryParams })
    } else {
      refetchHistoryData({ ...pathParams, queryParams })
    }
  }, [queryParams, pathParams, tab])

  useEffect(() => {
    if (downtimeData?.data?.content?.length === 0) {
      refetchHistoryData({ ...pathParams, queryParams })
    }
  }, [downtimeData])

  const onTabChange = (nextTab: SLODowntimeTabs): void => {
    if (nextTab !== tab) {
      history.push({
        pathname: routes.toCVSLODowntime({
          accountId,
          orgIdentifier,
          projectIdentifier,
          module: 'cv'
        }),
        search: getSearchString({
          tab: nextTab
        })
      })
      setMonitoredServiceOption(defaultOption)
      setPageNumber(0)
    }
  }

  const panelDowntime = (
    <DowntimeList
      downtimeDataLoading={downtimeDataLoading}
      downtimeData={downtimeData}
      refetchDowntimes={refetchDowntimes}
      downtimeError={getErrorMessage(downtimeError)}
    />
  )

  const panelHistory = (
    <DowntimeHistory
      downtimeHistoryLoading={downtimeHistoryLoading}
      downtimeHistoryData={downtimeHistoryData}
      refetchHistoryData={refetchHistoryData}
      downtimeHistoryError={getErrorMessage(downtimeHistoryError)}
    />
  )

  return (
    <>
      <Page.Header
        breadcrumbs={<NGBreadcrumbs />}
        title={
          <Layout.Vertical>
            <Text font={{ variation: FontVariation.H4 }} tooltipProps={{ dataTooltipId: 'downtimeHeader' }}>
              {getString('common.sloDowntimeLabel')}
            </Text>
          </Layout.Vertical>
        }
      />
      <FiltersContext.Provider
        value={{
          monitoredServicesData,
          monitoredServicesLoading,
          monitoredServiceOption,
          setMonitoredServiceOption,
          filter,
          setFilter,
          pageNumber,
          setPageNumber,
          hideResetFilterButton,
          queryParams,
          pathParams,
          appliedSearchAndFilter,
          handleCreateButton
        }}
      >
        <Page.Body className={css.pageBody} loading={!appliedSearchAndFilter && downtimeDataLoading}>
          {shouldRenderNoDataCard(appliedSearchAndFilter, downtimeData, downtimeHistoryData) ? (
            <NoDataCard
              image={noDowntimeData}
              messageTitle={getString('cv.sloDowntime.noData')}
              message={getMessageAndAddDowntimeButton(handleCreateButton, getString)}
              button={getRedirectLinks(getString)}
            />
          ) : (
            <Container className={css.downtimeTabs}>
              <Tabs
                id="sloDowntimeTabs"
                selectedTabId={tab}
                onChange={onTabChange}
                tabList={[
                  {
                    id: SLODowntimeTabs.DOWNTIME,
                    title: <DowntimeTabsTitle title={getString('cv.sloDowntime.label')} />,
                    panel: panelDowntime
                  },
                  {
                    id: SLODowntimeTabs.HISTORY,
                    title: <DowntimeTabsTitle title={getString('common.history')} />,
                    panel: panelHistory
                  }
                ]}
              />
            </Container>
          )}
        </Page.Body>
      </FiltersContext.Provider>
    </>
  )
}

export default SLODowntimePage
