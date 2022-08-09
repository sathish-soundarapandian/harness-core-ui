/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Breadcrumb, Layout } from '@harness/uicore'
import routes from '@common/RouteDefinitions'
import { Page } from '@common/exports'
import { useQueryParamsState } from '@common/hooks/useQueryParamsState'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useDashboardsContext } from '@dashboards/pages/DashboardsContext'
import LookerEmbeddedDashboard from '@dashboards/components/LookerEmbeddedDashboard/LookerEmbeddedDashboard'
import { SHARED_FOLDER_ID } from '@dashboards/constants'
import { LookerEventType } from '@dashboards/constants/LookerEventType'
import type { DashboardFiltersChangedEvent, LookerEvent, PageChangedEvent } from '@dashboards/types/LookerTypes.types'
import {
  ErrorResponse,
  useCreateSignedUrl,
  useGetDashboardDetail,
  useGetFolderDetail
} from 'services/custom-dashboards'
import css from './DashboardView.module.scss'

const DashboardViewPage: React.FC = () => {
  const { getString } = useStrings()
  const { includeBreadcrumbs } = useDashboardsContext()

  const { accountId, viewId, folderId } = useParams<AccountPathProps & { viewId: string; folderId: string }>()
  const [embedUrl, setEmbedUrl] = React.useState<string>()
  const [dashboardFilters, setDashboardFilters] = useQueryParamsState<string | undefined>('filters', undefined)
  const [dashboardLoading, setDashboardLoading] = React.useState<boolean>(false)
  const history = useHistory()

  const signedQueryUrl: string = useMemo(() => {
    const filters = dashboardFilters ? `&${dashboardFilters}` : ''
    return `/embed/dashboards-next/${viewId}?embed_domain=${location.host}${filters}`
  }, [dashboardFilters, viewId])

  const {
    mutate: createSignedUrl,
    loading,
    error
  } = useCreateSignedUrl({ queryParams: { accountId, dashboardId: viewId, src: signedQueryUrl } })

  const responseMessages = useMemo(() => (error?.data as ErrorResponse)?.responseMessages, [error])

  const loadingMessage = useMemo(() => {
    const message = getString('common.loading')
    return loading ? message.replace('...', '.') : undefined
  }, [getString, loading])

  const lookerDashboardFilterChangedEvent = React.useCallback(
    (eventData: DashboardFiltersChangedEvent): void => {
      setDashboardFilters(new URLSearchParams(eventData.dashboard.dashboard_filters).toString())
    },
    [setDashboardFilters]
  )

  const lookerPageChangedEvent = React.useCallback(
    (eventData: PageChangedEvent): void => {
      if (eventData.page?.url?.includes('embed/explore')) {
        history.go(0)
      }
    },
    [history]
  )

  const onLookerAction = React.useCallback(
    (lookerEvent: LookerEvent): void => {
      switch (lookerEvent.type) {
        case LookerEventType.PAGE_CHANGED:
          lookerPageChangedEvent(lookerEvent as PageChangedEvent)
          break
        case LookerEventType.DASHBOARD_FILTERS_CHANGED:
          lookerDashboardFilterChangedEvent(lookerEvent as DashboardFiltersChangedEvent)
          break
        case LookerEventType.DASHBOARD_LOADED:
          setDashboardLoading(false)
          break
      }
    },
    [lookerDashboardFilterChangedEvent, lookerPageChangedEvent]
  )

  React.useEffect(() => {
    const generateSignedUrl = async (): Promise<void> => {
      const { resource } = (await createSignedUrl()) || {}
      if (resource) {
        setDashboardLoading(true)
        setEmbedUrl(resource)
      }
    }

    generateSignedUrl()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewId])

  const { data: folderDetail, refetch: fetchFolderDetail } = useGetFolderDetail({
    lazy: true,
    queryParams: { accountId, folderId }
  })

  React.useEffect(() => {
    if (folderId !== SHARED_FOLDER_ID) {
      fetchFolderDetail()
    }
  }, [accountId, fetchFolderDetail, folderId])

  const { data: dashboardDetail } = useGetDashboardDetail({ dashboard_id: viewId, queryParams: { accountId } })

  React.useEffect(() => {
    const links: Breadcrumb[] = []
    if (folderDetail?.resource) {
      links.push({
        url: routes.toCustomFolderHome({ accountId }),
        label: getString('dashboards.homePage.folders')
      })
      links.push({
        url: routes.toViewCustomFolder({ folderId, accountId }),
        label: folderDetail.resource
      })
    }
    embedUrl &&
      dashboardDetail &&
      links.push({
        url: routes.toViewCustomDashboard({ viewId, folderId, accountId }),
        label: dashboardDetail.title
      })
    includeBreadcrumbs(links)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderDetail?.resource, dashboardDetail, accountId, viewId, embedUrl])

  return (
    <Page.Body
      className={css.pageContainer}
      loading={loading || dashboardLoading}
      loadingMessage={loadingMessage}
      error={responseMessages}
      noData={{
        when: () => embedUrl === undefined,
        icon: 'dashboard',
        message: 'Dashboard not available'
      }}
    >
      <Layout.Vertical className={css.frame}>
        {embedUrl && <LookerEmbeddedDashboard embedUrl={embedUrl} onLookerAction={onLookerAction} />}
      </Layout.Vertical>
    </Page.Body>
  )
}

export default DashboardViewPage
