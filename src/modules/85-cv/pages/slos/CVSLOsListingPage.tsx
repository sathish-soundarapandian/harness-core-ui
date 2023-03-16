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
  TableV2,
  Text,
  IconName,
  Tag,
  ExpandingSearchInput
} from '@harness/uicore'
import { Intent, Color, FontVariation } from '@harness/design-system'
import { defaultTo } from 'lodash-es'
import type { CellProps, Renderer } from 'react-table'
import { HelpPanel, HelpPanelType } from '@harness/help-panel'
import slosEmptyState from '@cv/assets/slosEmptyState.svg'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import {
  useGetAllJourneys,
  useGetServiceLevelObjectivesRiskCount,
  RiskCount,
  useGetSLOHealthListView,
  useGetSLOAssociatedMonitoredServices,
  useDeleteSLOV2Data
} from 'services/cv'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import RbacButton from '@rbac/components/Button/Button'
import {
  getErrorMessage,
  getRiskColorLogo,
  getRiskColorValue,
  getSearchString,
  getSecondaryRiskColorValue
} from '@cv/utils/CommonUtils'
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
  getServiceTitle,
  getSLOsNoDataMessageTitle
} from './CVSLOListingPage.utils'
import SLODashbordFilters from './components/SLODashbordFilters/SLODashbordFilters'
import { SLOType } from './components/CVCreateSLOV2/CVCreateSLOV2.constants'
import SLOActions from './components/SLOActions/SLOActions'
import { SLODetailsPageTabIds } from './CVSLODetailsPage/CVSLODetailsPage.types'
import css from './CVSLOsListingPage.module.scss'

const CVSLOsListingPage: React.FC<CVSLOsListingPageProps> = ({ monitoredService }) => {
  const history = useHistory()
  const { getString } = useStrings()
  const SRM_COMPOSITE_SLO = useFeatureFlag(FeatureFlag.SRM_COMPOSITE_SLO)
  const monitoredServiceIdentifier = useMemo(() => monitoredService?.identifier, [monitoredService?.identifier])
  useDocumentTitle([getString('cv.srmTitle'), getServiceTitle(getString, monitoredServiceIdentifier)])

  const { showError, showSuccess } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const isAccountLevel = !orgIdentifier && !projectIdentifier && !!accountId
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

  const { mutate: deleteSLO, loading: deleteSLOLoading } = useDeleteSLOV2Data({
    queryParams: pathParams
  })

  const onEdit = (sloIdentifier: string, sloType?: string): void => {
    isAccountLevel
      ? history.push({
          pathname: routes.toAccountCVSLODetailsPage({
            identifier: sloIdentifier,
            accountId
          }),
          search: getSearchString({ tab: SLODetailsPageTabIds.Configurations, sloType })
        })
      : history.push({
          pathname: routes.toCVSLODetailsPage({
            identifier: sloIdentifier,
            accountId,
            orgIdentifier,
            projectIdentifier
          }),
          search: getSearchString({ tab: SLODetailsPageTabIds.Configurations, monitoredServiceIdentifier, sloType })
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
    <Layout.Horizontal spacing="medium">
      {!isAccountLevel && (
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
      )}
      {SRM_COMPOSITE_SLO && !monitoredService && (
        <RbacButton
          icon="plus"
          data-testid="createCompositeSLO"
          text={getString('cv.slos.createCompositeSLO')}
          variation={ButtonVariation.PRIMARY}
          onClick={() => {
            isAccountLevel
              ? history.push({
                  pathname: routes.toAccountCVCreateCompositeSLOs({
                    accountId,
                    module: 'cv'
                  })
                })
              : history.push({
                  pathname: routes.toCVCreateCompositeSLOs({
                    accountId,
                    orgIdentifier,
                    projectIdentifier,
                    module: 'cv'
                  }),
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
      )}
    </Layout.Horizontal>
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
    const { name = '', sloIdentifier = '', description = '', sloType = '' } = slo || {}
    const path = isAccountLevel
      ? routes.toAccountCVSLODetailsPage({
          identifier: sloIdentifier,
          accountId
        })
      : routes.toCVSLODetailsPage({
          identifier: sloIdentifier,
          accountId,
          orgIdentifier,
          projectIdentifier
        })
    const queryParams = getSearchString({ sloType })
    return (
      <>
        <Link to={`${path}${queryParams}`}>
          <Text color={Color.PRIMARY_7} title={name} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
            {name} {sloType === SLOType.COMPOSITE && <Tag intent={Intent.PRIMARY}>{sloType}</Tag>}
          </Text>
          <Text
            tooltipProps={{ disabled: true }}
            lineClamp={1}
            title={description}
            color={Color.GREY_700}
            font={{ align: 'left', size: 'small' }}
          >
            {description}
          </Text>
        </Link>
      </>
    )
  }

  const RenderMonitoredService: Renderer<CellProps<any>> = ({ row }) => {
    const slo = row?.original
    const { serviceName = '', environmentIdentifier = '', monitoredServiceIdentifier: identifier = '' } = slo || {}

    return identifier ? (
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
          <Text color={Color.PRIMARY_7} title={environmentIdentifier} font={{ align: 'left', size: 'small' }}>
            {environmentIdentifier}
          </Text>
        </Link>
      </Layout.Vertical>
    ) : (
      <Layout.Vertical padding={{ left: 'small' }}>NA</Layout.Vertical>
    )
  }

  const RenderAlerts: Renderer<CellProps<any>> = ({ row }) => {
    const slo = row?.original
    const { noOfActiveAlerts = 0 } = slo || {}
    return (
      <Text
        className={css.titleInSloTable}
        title={`${noOfActiveAlerts}`}
        font={{ align: 'left', size: 'normal', weight: 'light' }}
        color={Color.GREY_900}
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
        font={{ align: 'left', size: 'normal', weight: 'light' }}
        color={Color.GREY_900}
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
        font={{ align: 'left', size: 'normal', weight: 'light' }}
        color={Color.GREY_900}
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
        font={{ align: 'left', size: 'normal', weight: 'light' }}
        color={Color.GREY_900}
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
        style={{ color: getRiskColorValue(errorBudgetRisk), background: getSecondaryRiskColorValue(errorBudgetRisk) }}
        font={{ align: 'left' }}
        iconProps={{ color: getRiskColorValue(errorBudgetRisk, false), margin: { right: 'xxsmall' }, size: 14 }}
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
      <Layout.Horizontal className={css.errorBudgetParent}>
        <Text
          className={css.titleInSloTable}
          title={` ${Number(errorBudgetRemainingPercentage || 0).toFixed(2)}%`}
          font={{ align: 'left', size: 'normal', weight: 'light' }}
          padding={{ right: 'small' }}
          color={Color.GREY_900}
        >
          {` ${Number(errorBudgetRemainingPercentage || 0).toFixed(2)}%`}
        </Text>
        <Container className={css.errorBudgetRemainingContainer}>
          <Text
            font={{ variation: FontVariation.SMALL }}
            lineClamp={1}
            title={`${errorBudgetRemaining} m`}
            color={Color.GREY_700}
            className={css.errorBudgetRemaining}
          >
            {`${errorBudgetRemaining} m`}
          </Text>
        </Container>
      </Layout.Horizontal>
    )
  }

  const RenderSLOActions: Renderer<CellProps<any>> = ({ row }) => {
    const slo = row?.original
    const { sloIdentifier = '', name = '', sloType = '' } = slo || {}
    return (
      <SLOActions
        sloIdentifier={sloIdentifier}
        title={name}
        onDelete={onDelete}
        sloType={sloType}
        onEdit={(id: string) => onEdit(id, sloType)}
      />
    )
  }

  const columns = [
    {
      Header: getString('cv.slos.sloName').toUpperCase(),
      width: '18%',
      Cell: RenderSLOName
    },
    {
      Header: getString('cv.slos.monitoredService').toUpperCase(),
      width: '19%',
      Cell: RenderMonitoredService
    },
    {
      Header: getString('cv.slos.status').toUpperCase(),
      width: '12%',
      Cell: RenderSLOStatus
    },
    {
      Header: getString('cv.errorBudgetRemaining').toUpperCase(),
      width: '12%',
      Cell: RenderRemainingErrorBudget
    },
    {
      Header: getString('cv.slos.target').toUpperCase(),
      width: '6%',
      Cell: RenderTarget
    },
    {
      Header: getString('cv.slos.burnRate').toUpperCase(),
      width: '9%',
      Cell: RenderBurnRate
    },
    {
      Header: getString('ce.budgets.listPage.tableHeaders.alerts').toUpperCase(),
      width: '6%',
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
  ]

  const filteredColumns = isAccountLevel
    ? columns.filter(column => column.Header !== getString('cv.slos.monitoredService').toUpperCase())
    : columns

  return (
    <>
      <HelpPanel referenceId="sloDetails" type={HelpPanelType.FLOATING_CONTAINER} />
      {!monitoredServiceIdentifier && hasSloFilterApplied && (
        <>
          <Page.Header
            breadcrumbs={<NGBreadcrumbs />}
            className={css.sloListingPageHeader}
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
          messageTitle: getString('common.sloNoData'),
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
                  isAccountLevel={isAccountLevel}
                />
                <ExpandingSearchInput
                  width={250}
                  throttle={500}
                  onChange={setSearch}
                  autoFocus={false}
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
                columns={filteredColumns}
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
              messageTitle={getSLOsNoDataMessageTitle({
                monitoredServiceIdentifier,
                getString,
                riskCountResponse,
                filterState,
                search
              })}
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
