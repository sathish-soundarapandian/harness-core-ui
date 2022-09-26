/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useEffect, useState, useMemo, useReducer } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import {
  useToaster,
  ButtonVariation,
  CardSelect,
  CardSelectType,
  NoDataCard,
  Layout,
  FlexExpander,
  Container,
  SelectOption,
  TableV2,
  Text,
  IconName,
  ExpandingSearchInput
} from '@wings-software/uicore'

import { Color, FontVariation } from '@harness/design-system'
import { filter, isEmpty, compact, values, defaultTo } from 'lodash-es'
import type { CellProps, Renderer } from 'react-table'
import slosEmptyState from '@cv/assets/slosEmptyState.svg'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import {
  useDeleteSLOData,
  useGetAllJourneys,
  useGetServiceLevelObjectivesRiskCount,
  RiskCount,
  useGetSLOHealthListView,
  useGetSLOAssociatedMonitoredServices
} from 'services/cv'
import RbacButton from '@rbac/components/Button/Button'
import { getErrorMessage, getRiskColorLogo, getRiskColorValue, getSearchString } from '@cv/utils/CommonUtils'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import SLOCardSelect from './components/SLOCardSelect/SLOCardSelect'
import type { CVSLOsListingPageProps, RiskTypes, SLORiskFilter } from './CVSLOsListingPage.types'
import {
  getErrorObject,
  getIsSLODashboardAPIsLoading,
  getSLORiskTypeFilter,
  getIsWidgetDataEmpty,
  getIsSetPreviousPage,
  sloFilterReducer,
  SLODashboardFilterActions,
  getInitialFilterStateLazy,
  getSLODashboardWidgetsParams,
  getServiceLevelObjectivesRiskCountParams,
  getUserJourneyParams,
  getMonitoredServicesInitialState,
  getInitialFilterState,
  getClassNameForMonitoredServicePage,
  isSLOFilterApplied,
  getServiceTitle
} from './CVSLOListingPage.utils'
import SLODashbordFilters from './components/SLODashbordFilters/SLODashbordFilters'
import SLOActions from './components/SLOActions/SLOActions'
import { SLODetailsPageTabIds } from './CVSLODetailsPage/CVSLODetailsPage.types'
import css from './CVSLOsListingPage.module.scss'

const CVSLOsListingPage: React.FC<CVSLOsListingPageProps> = ({ monitoredService }) => {
  const history = useHistory()
  const { getString } = useStrings()
  const monitoredServiceIdentifier = useMemo(() => monitoredService?.identifier, [monitoredService?.identifier])
  useDocumentTitle([getString('cv.srmTitle'), getServiceTitle(getString, monitoredServiceIdentifier)])

  const { showError, showSuccess } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [filterState, dispatch] = useReducer(sloFilterReducer, getInitialFilterState(getString), passedInitialState =>
    getInitialFilterStateLazy(passedInitialState, monitoredService)
  )
  const [pageNumber, setPageNumber] = useState(0)
  const [search, setSearch] = useState<string>('')

  useEffect(() => {
    if (monitoredService && monitoredServiceIdentifier) {
      dispatch(SLODashboardFilterActions.updateMonitoredServices(getMonitoredServicesInitialState(monitoredService)))
    }
  }, [monitoredService])

  const pathParams = useMemo(() => {
    return {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  }, [accountId, orgIdentifier, projectIdentifier])

  const sloDashboardWidgetsParams = useMemo(() => {
    return getSLODashboardWidgetsParams(pathParams, getString, filterState, pageNumber, search)
  }, [pathParams, filterState, pageNumber, search])

  const {
    data: dashboardWidgetsResponse,
    loading: dashboardWidgetsLoading,
    refetch: refetchDashboardWidgets,
    error: dashboardWidgetsError
  } = useGetSLOHealthListView(sloDashboardWidgetsParams)

  const {
    data: riskCountResponse,
    loading: riskCountLoading,
    refetch: refetchRiskCount,
    error: dashboardRiskCountError
  } = useGetServiceLevelObjectivesRiskCount(
    getServiceLevelObjectivesRiskCountParams(pathParams, getString, filterState)
  )

  const {
    data: monitoredServicesData,
    loading: monitoredServicesLoading,
    error: monitoredServicesDataError,
    refetch: refetchMonitoredServicesData
  } = useGetSLOAssociatedMonitoredServices({
    queryParams: pathParams
  })

  const {
    content,
    totalItems = 0,
    totalPages = 0,
    pageIndex = 0,
    pageItemCount = 0,
    pageSize = 10
  } = dashboardWidgetsResponse?.data ?? {}

  const {
    data: userJourneysData,
    loading: userJourneysLoading,
    error: userJourneysError,
    refetch: refetchUserJourneys
  } = useGetAllJourneys(getUserJourneyParams(pathParams))

  const { mutate: deleteSLO, loading: deleteSLOLoading } = useDeleteSLOData({
    queryParams: pathParams
  })

  const onEdit = (sloIdentifier: string): void => {
    history.push({
      pathname: routes.toCVSLODetailsPage({
        identifier: sloIdentifier,
        accountId,
        orgIdentifier,
        projectIdentifier
      }),
      search: getSearchString({ tab: SLODetailsPageTabIds.Configurations, monitoredServiceIdentifier })
    })
  }

  const onDelete = async (identifier: string, name: string): Promise<void> => {
    try {
      await deleteSLO(identifier)
      if (getIsSetPreviousPage(pageIndex, pageItemCount)) {
        setPageNumber(prevPageNumber => prevPageNumber - 1)
      } else {
        await refetchDashboardWidgets()
      }
      await refetchRiskCount()
      showSuccess(getString('cv.slos.sloDeleted', { name }))
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  const getAddSLOButton = (): JSX.Element => (
    <RbacButton
      icon="plus"
      text={getString('cv.slos.createSLO')}
      variation={ButtonVariation.PRIMARY}
      onClick={() => {
        history.push({
          pathname: routes.toCVCreateSLOs({ accountId, orgIdentifier, projectIdentifier, module: 'cv' }),
          search: monitoredServiceIdentifier ? `?monitoredServiceIdentifier=${monitoredServiceIdentifier}` : ''
        })
      }}
      className={getClassNameForMonitoredServicePage(css.createSloInMonitoredService, monitoredServiceIdentifier)}
      permission={{
        permission: PermissionIdentifier.EDIT_SLO_SERVICE,
        resource: {
          resourceType: ResourceType.SLO,
          resourceIdentifier: projectIdentifier
        }
      }}
    />
  )

  const onFilter = (currentRiskFilter: SLORiskFilter): void => {
    setPageNumber(0)
    const { updateSloRiskType } = SLODashboardFilterActions
    if (filterState.sloRiskFilter?.identifier === currentRiskFilter.identifier) {
      dispatch(updateSloRiskType({ sloRiskFilter: null }))
    } else {
      dispatch(updateSloRiskType({ sloRiskFilter: currentRiskFilter }))
    }
  }

  const filterItemsData = useMemo(
    () => ({ userJourney: userJourneysData, monitoredServices: monitoredServicesData }),
    [userJourneysData, monitoredServicesData]
  )

  const hasSloFilterApplied = useMemo(
    () => isSLOFilterApplied(getString, filterState) || !!riskCountResponse?.data?.totalCount,
    [isSLOFilterApplied(getString, filterState), riskCountResponse?.data?.totalCount]
  )

  const RenderSLOName: Renderer<CellProps<any>> = ({ row }) => {
    const slo = row?.original
    const { name = '', sloIdentifier = '', description = '' } = slo || {}

    return (
      <Link
        to={routes.toCVSLODetailsPage({
          identifier: sloIdentifier,
          accountId,
          orgIdentifier,
          projectIdentifier
        })}
      >
        <Text color={Color.PRIMARY_7} title={name} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
          {name}
        </Text>
        <Text title={name} font={{ align: 'left', size: 'small' }}>
          {description}
        </Text>
      </Link>
    )
  }

  const RenderMonitoredService: Renderer<CellProps<any>> = ({ row }) => {
    const slo = row?.original
    const { serviceName = '', environmentIdentifier = '', monitoredServiceIdentifier: identifier = '' } = slo || {}

    return (
      <Layout.Vertical padding={{ left: 'small' }}>
        <Link
          to={routes.toCVAddMonitoringServicesEdit({
            accountId,
            orgIdentifier,
            projectIdentifier,
            identifier,
            module: 'cv'
          })}
        >
          <Text
            color={Color.PRIMARY_7}
            className={css.titleInSloTable}
            title={serviceName}
            font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}
          >
            {serviceName}
          </Text>
        </Link>
        <Link
          to={routes.toCVAddMonitoringServicesEdit({
            accountId,
            projectIdentifier,
            orgIdentifier,
            identifier,
            module: 'cv'
          })}
        >
          <Text color={Color.PRIMARY_7} title={environmentIdentifier} font={{ align: 'left', size: 'xsmall' }}>
            {environmentIdentifier}
          </Text>
        </Link>
      </Layout.Vertical>
    )
  }

  const RenderAlerts: Renderer<CellProps<any>> = ({ row }) => {
    const slo = row?.original
    const { noOfActiveAlerts = 0 } = slo || {}
    return (
      <Text
        className={css.titleInSloTable}
        title={`${noOfActiveAlerts}`}
        font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}
      >
        {`${noOfActiveAlerts}`}
      </Text>
    )
  }

  const RenderBurnRate: Renderer<CellProps<any>> = ({ row }) => {
    const slo = row?.original
    const { burnRate } = slo || {}
    return (
      <Text
        className={css.titleInSloTable}
        title={`${defaultTo(Number(burnRate), 0).toFixed(2)}%`}
        font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}
      >
        {defaultTo(Number(burnRate), 0).toFixed(2)}%
      </Text>
    )
  }

  const RenderUserJourney: Renderer<CellProps<any>> = ({ row }) => {
    const slo = row?.original
    const { userJourneyName = '' } = slo || {}
    return (
      <Text
        className={css.titleInSloTable}
        title={userJourneyName}
        font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}
      >
        {userJourneyName}
      </Text>
    )
  }

  const RenderTarget: Renderer<CellProps<any>> = ({ row }) => {
    const slo = row.original
    return (
      <Text
        className={css.titleInSloTable}
        title={` ${Number((Number(slo?.sloTargetPercentage) || 0).toFixed(2))}%`}
        font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}
      >
        {` ${Number((Number(slo?.sloTargetPercentage) || 0).toFixed(2))}%`}
      </Text>
    )
  }

  const RenderSLOStatus: Renderer<CellProps<any>> = ({ row }) => {
    const slo = row?.original
    const { errorBudgetRisk } = slo || {}
    const riskCategory = getRiskColorLogo(errorBudgetRisk?.toUpperCase()?.replace(/ /g, '_') as RiskTypes) as IconName

    return (
      <Text
        className={css.errorBudgetRisk}
        title={errorBudgetRisk}
        style={{ backgroundColor: getRiskColorValue(errorBudgetRisk), color: Color.WHITE }}
        font={{ align: 'left', size: 'normal' }}
        iconProps={{ color: Color.WHITE, padding: { right: 'small' } }}
        icon={riskCategory}
      >
        {errorBudgetRisk}
      </Text>
    )
  }

  const RenderRemainingErrorBudget: Renderer<CellProps<any>> = ({ row }) => {
    const slo = row?.original
    const { errorBudgetRemainingPercentage = '', errorBudgetRemaining = '' } = slo || {}
    return (
      <Layout.Horizontal>
        <Text
          className={css.titleInSloTable}
          title={` ${Number(errorBudgetRemainingPercentage || 0).toFixed(2)}%`}
          font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}
          padding={{ right: 'small' }}
        >
          {` ${Number(errorBudgetRemainingPercentage || 0).toFixed(2)}%`}
        </Text>
        <Container className={css.errorBudgetRemainingContainer}>
          <Text font={{ variation: FontVariation.SMALL }} className={css.errorBudgetRemaining}>
            {`${errorBudgetRemaining} m`}
          </Text>
        </Container>
      </Layout.Horizontal>
    )
  }

  const RenderSLOActions: Renderer<CellProps<any>> = ({ row }) => {
    const slo = row?.original
    const { sloIdentifier = '', name = '' } = slo || {}
    return <SLOActions sloIdentifier={sloIdentifier} title={name} onDelete={onDelete} onEdit={onEdit} />
  }
  return (
    <>
      {!monitoredServiceIdentifier && hasSloFilterApplied && (
        <>
          <Page.Header
            breadcrumbs={<NGBreadcrumbs />}
            title={
              <Layout.Vertical>
                <Text font={{ variation: FontVariation.H4 }} tooltipProps={{ dataTooltipId: 'sloHeader' }}>
                  {getString('cv.slos.completeTitle')}
                </Text>
                <Text title={getString('cv.slos.subTitle')} font={{ align: 'left', size: 'small' }}>
                  {getString('cv.slos.subTitle')}
                </Text>
              </Layout.Vertical>
            }
          />
          <Page.Header title={getAddSLOButton()} />
        </>
      )}

      <Page.Body
        loading={getIsSLODashboardAPIsLoading(
          userJourneysLoading,
          dashboardWidgetsLoading,
          deleteSLOLoading,
          monitoredServicesLoading,
          riskCountLoading
        )}
        error={getErrorMessage(
          getErrorObject(dashboardWidgetsError, userJourneysError, dashboardRiskCountError, monitoredServicesDataError)
        )}
        retryOnError={() => {
          if (dashboardWidgetsError) {
            refetchDashboardWidgets()
          }
          if (userJourneysError) {
            refetchUserJourneys()
          }
          if (monitoredServicesDataError) {
            refetchMonitoredServicesData()
          }

          if (dashboardRiskCountError) {
            refetchRiskCount()
          }
        }}
        noData={{
          when: () => !isSLOFilterApplied(getString, filterState) && !riskCountResponse?.data?.totalCount,
          messageTitle: getString('cv.slos.noData'),
          message: getString('cv.slos.noSLOsStateMessage'),
          button: getAddSLOButton(),
          image: slosEmptyState
        }}
        className={css.pageBody}
      >
        <Layout.Vertical height="100%" padding={{ top: 'medium', left: 'xlarge', right: 'xlarge', bottom: 'xlarge' }}>
          <Layout.Horizontal className={css.sloFiltersRow1}>
            {monitoredServiceIdentifier && getAddSLOButton()}
            {hasSloFilterApplied && (
              <Container
                flex
                className={getClassNameForMonitoredServicePage(css.sloDropdownFilters, monitoredServiceIdentifier)}
              >
                <SLODashbordFilters
                  filterState={filterState}
                  dispatch={dispatch}
                  filterItemsData={filterItemsData}
                  hideMonitoresServicesFilter={Boolean(monitoredService)}
                />
                <ExpandingSearchInput
                  width={250}
                  throttle={500}
                  onChange={setSearch}
                  placeholder={getString('cv.slos.searchSLO')}
                />
              </Container>
            )}
          </Layout.Horizontal>
          {hasSloFilterApplied && (
            <>
              <CardSelect<SLORiskFilter>
                type={CardSelectType.CardView}
                data={getSLORiskTypeFilter(
                  getString,
                  riskCountResponse?.data?.riskCounts as RiskCount[] | undefined,
                  riskCountResponse?.data?.totalCount
                )}
                cardClassName={css.sloRiskFilterCard}
                renderItem={({ ...props }) => <SLOCardSelect key={props.identifier} {...props} />}
                selected={filterState.sloRiskFilter as SLORiskFilter}
                onChange={onFilter}
              />
              <hr />
            </>
          )}
          {!!content?.length && (
            <>
              <TableV2
                sortable={false}
                columns={[
                  {
                    Header: getString('cv.slos.sloName').toUpperCase(),
                    width: '18%',
                    Cell: RenderSLOName
                  },
                  {
                    Header: getString('cv.slos.monitoredService').toUpperCase(),
                    width: '12%',
                    Cell: RenderMonitoredService
                  },
                  {
                    Header: getString('cv.slos.status').toUpperCase(),
                    width: '13%',
                    Cell: RenderSLOStatus
                  },
                  {
                    Header: getString('cv.errorBudgetRemaining').toUpperCase(),
                    width: '12%',
                    Cell: RenderRemainingErrorBudget
                  },
                  {
                    Header: getString('cv.slos.target').toUpperCase(),
                    width: '10%',
                    Cell: RenderTarget
                  },
                  {
                    Header: getString('cv.slos.burnRate').toUpperCase(),
                    width: '9%',
                    Cell: RenderBurnRate
                  },
                  {
                    Header: getString('ce.budgets.listPage.tableHeaders.alerts').toUpperCase(),
                    width: '8%',
                    Cell: RenderAlerts
                  },
                  {
                    Header: getString('cv.slos.userJourney').toUpperCase(),
                    width: '10%',
                    Cell: RenderUserJourney
                  },
                  {
                    Header: '',
                    id: 'sloActions',
                    width: '8%',
                    Cell: RenderSLOActions
                  }
                ]}
                data={content}
                pagination={{
                  pageSize,
                  pageIndex,
                  pageCount: totalPages,
                  itemCount: totalItems,
                  gotoPage: nextPage => {
                    setPageNumber(nextPage)
                  }
                }}
              />
              <FlexExpander />
            </>
          )}

          {getIsWidgetDataEmpty(content?.length, dashboardWidgetsLoading) && (
            <NoDataCard
              image={slosEmptyState}
              messageTitle={
                monitoredServiceIdentifier
                  ? getString('cv.slos.noDataMS')
                  : !riskCountResponse?.data?.riskCounts ||
                    isEmpty(filter(compact(values(filterState)), ({ label }: SelectOption) => label !== 'All'))
                  ? getString('cv.slos.noData')
                  : getString('cv.slos.noMatchingData')
              }
              message={getString('cv.slos.noSLOsStateMessage')}
              className={css.noSloData}
            />
          )}
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}
export default CVSLOsListingPage
