/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Container, FlexExpander, Page, Tabs } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useDeleteSLOV2Data, useGetSLODetails, useResetErrorBudget } from 'services/cv'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { getErrorMessage, getSearchString } from '@cv/utils/CommonUtils'
import HeaderTitle from './views/HeaderTitle'
import HeaderToolbar from './views/HeaderToolbar'
import DetailsPanel from './DetailsPanel/DetailsPanel'
import TabToolbar from './DetailsPanel/views/TabToolbar'
import { SLODetailsPageTabIds } from './CVSLODetailsPage.types'
import CVCreateSLOV2 from '../components/CVCreateSLOV2/CVCreateSLOV2'
import { SLOType } from '../components/CVCreateSLOV2/CVCreateSLOV2.constants'
import css from './CVSLODetailsPage.module.scss'

const CVSLODetailsPage: React.FC = () => {
  const history = useHistory()
  const { getString } = useStrings()

  useDocumentTitle([getString('cv.srmTitle'), getString('cv.slos.title')])

  const { accountId, orgIdentifier, projectIdentifier, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()
  const {
    tab = SLODetailsPageTabIds.Details,
    monitoredServiceIdentifier,
    sloType,
    notificationTime
  } = useQueryParams<{
    tab?: SLODetailsPageTabIds
    monitoredServiceIdentifier?: string
    sloType?: string
    notificationTime?: number
  }>()

  const projectIdentifierRef = useRef<string>()
  const isCompositeSLO = sloType === SLOType.COMPOSITE
  const isAccountLevel = !orgIdentifier && !projectIdentifier && !!accountId
  const pathQueryParams = isAccountLevel ? { accountId } : { accountId, orgIdentifier, projectIdentifier }
  useEffect(() => {
    if (!isAccountLevel && projectIdentifierRef.current && projectIdentifierRef.current !== projectIdentifier) {
      history.push(routes.toCVSLOs({ accountId, orgIdentifier, projectIdentifier }))
    }

    projectIdentifierRef.current = projectIdentifier
  }, [accountId, orgIdentifier, projectIdentifier, history])

  const {
    data,
    loading: sloDetailsLoading,
    error,
    refetch
  } = useGetSLODetails({
    identifier,
    queryParams: {
      ...pathQueryParams
    },
    lazy: true
  })

  useEffect(() => {
    if (identifier) {
      refetch()
    }
  }, [identifier])

  const { mutate: resetErrorBudget, loading: resetErrorBudgetLoading } = useResetErrorBudget({
    identifier: '',
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { mutate: deleteSLOV2, loading: deleteSLOV2Loading } = useDeleteSLOV2Data({
    queryParams: {
      ...pathQueryParams
    }
  })

  const onTabChange = (nextTab: SLODetailsPageTabIds): void => {
    /* istanbul ignore else */ if (nextTab !== tab) {
      isAccountLevel
        ? history.push({
            pathname: routes.toAccountCVSLODetailsPage({
              identifier,
              accountId
            }),
            search: getSearchString({ tab: nextTab, sloType, notificationTime })
          })
        : history.push({
            pathname: routes.toCVSLODetailsPage({
              identifier,
              accountId,
              orgIdentifier,
              projectIdentifier
            }),
            search: getSearchString({ tab: nextTab, monitoredServiceIdentifier, sloType, notificationTime })
          })
    }
  }

  const { description, createdAt, lastModifiedAt, sloDashboardWidget, timeRangeFilters } = data?.data ?? {}
  const loading = sloDetailsLoading || resetErrorBudgetLoading || deleteSLOV2Loading

  const breadcrumbLinks = [
    {
      url: routes.toCVSLOs({ accountId, orgIdentifier, projectIdentifier }),
      label: getString('cv.SLO')
    }
  ]

  return (
    <>
      <Page.Header
        size="large"
        title={
          <HeaderTitle
            loading={sloDetailsLoading}
            title={sloDashboardWidget?.title}
            description={description}
            tag={sloType}
          />
        }
        toolbar={<HeaderToolbar loading={sloDetailsLoading} createdAt={createdAt} lastModifiedAt={lastModifiedAt} />}
        breadcrumbs={<NGBreadcrumbs links={breadcrumbLinks} />}
      />
      <Container className={css.tabContainer}>
        <Tabs
          id="slo-details-page-tabs"
          selectedTabId={tab}
          onChange={onTabChange}
          tabList={[
            {
              id: SLODetailsPageTabIds.Details,
              title: getString('details'),
              panel: (
                <DetailsPanel
                  loading={loading}
                  errorMessage={getErrorMessage(error)}
                  retryOnError={() => refetch()}
                  sloDashboardWidget={sloDashboardWidget}
                  timeRangeFilters={timeRangeFilters}
                />
              )
            },
            {
              id: SLODetailsPageTabIds.Configurations,
              title: getString('common.configurations'),
              panel: (
                <Page.Body
                  loading={loading}
                  error={getErrorMessage(error)}
                  retryOnError={() => refetch()}
                  noData={{
                    when: () => !sloDashboardWidget && !isCompositeSLO
                  }}
                >
                  {isCompositeSLO ? <CVCreateSLOV2 isComposite /> : <CVCreateSLOV2 />}
                </Page.Body>
              )
            }
          ]}
        >
          <FlexExpander />
          {tab === SLODetailsPageTabIds.Details && sloDashboardWidget && (
            <TabToolbar
              sloDashboardWidget={sloDashboardWidget}
              resetErrorBudget={resetErrorBudget}
              deleteSLO={deleteSLOV2}
              refetchSLODetails={refetch}
              onTabChange={onTabChange}
              isCompositeSLO={isCompositeSLO}
            />
          )}
        </Tabs>
      </Container>
    </>
  )
}

export default CVSLODetailsPage
