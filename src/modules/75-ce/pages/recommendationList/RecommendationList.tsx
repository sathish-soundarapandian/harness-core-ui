/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Card, Text, Layout, Container, Icon, Button, ButtonVariation, TableV2, IconName } from '@harness/uicore'
import { useHistory, useParams, Link } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'
import qs from 'qs'
import { Color, FontVariation } from '@harness/design-system'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { String, useStrings } from 'framework/strings'
import { ResourceType, useFetchCcmMetaDataQuery, CcmMetaData, Maybe } from 'services/ce/services'
import routes from '@common/RouteDefinitions'
import { Page } from '@common/exports'
import { useDeepCompareEffect, useQueryParams } from '@common/hooks'
import formatCost from '@ce/utils/formatCost'
import { getViewFilterForId, GROUP_BY_CLUSTER_NAME } from '@ce/utils/perspectiveUtils'
import EmptyView from '@ce/images/empty-state.svg'
import OverviewAddCluster from '@ce/components/OverviewPage/OverviewAddCluster'
import { PAGE_NAMES, USER_JOURNEY_EVENTS } from '@ce/TrackingEventsConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { CCM_PAGE_TYPE, CloudProvider } from '@ce/types'
import { calculateSavingsPercentage, getProviderIcon, resourceTypeToRoute } from '@ce/utils/recommendationUtils'
import { generateFilters } from '@ce/utils/anomaliesUtils'
import { getIdentifierFromName } from '@common/utils/StringUtils'
import { UNSAVED_FILTER } from '@common/components/Filter/utils/FilterUtils'
import { useQueryParamsState } from '@common/hooks/useQueryParamsState'
import {
  CCMRecommendationFilterProperties,
  FilterDTO,
  QLCEViewFilterWrapper,
  RecommendationItemDTO,
  RecommendationOverviewStats,
  useListRecommendations,
  useRecommendationsCount,
  useRecommendationStats
} from 'services/ce'
import { getEmissionsValue } from '@ce/utils/formatResourceValue'
import greenLeafImg from '@ce/common/images/green-leaf.svg'
import grayLeafImg from '@ce/common/images/gray-leaf.svg'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { StringsMap } from 'stringTypes'
import HandleError from '@ce/components/PermissionError/PermissionError'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import PermissionError from '@ce/images/permission-error.svg'
import RecommendationSavingsCard from '../../components/RecommendationSavingsCard/RecommendationSavingsCard'
import RecommendationFilters from '../../components/RecommendationFilters'
import css from './RecommendationList.module.scss'

interface RecommendationListProps {
  data: RecommendationItemDTO[]
  fetching: boolean
  ccmData: Maybe<CcmMetaData> | undefined
  pagination: {
    itemCount: number
    pageSize: number
    pageCount: number
    pageIndex: number
    gotoPage: (pageNumber: number) => void
  }
  onAddClusterSuccess: () => void
  filters?: CCMRecommendationFilterProperties
}

const RecommendationsList: React.FC<RecommendationListProps> = ({
  data,
  pagination,
  fetching,
  ccmData,
  onAddClusterSuccess,
  filters
}) => {
  const history = useHistory()
  const { trackEvent } = useTelemetry()
  const { accountId } = useParams<{ accountId: string }>()

  const { getString } = useStrings()

  const resourceTypeMap: Record<ResourceType, string> = useMemo(
    () => ({
      [ResourceType.Workload]: getString('ce.overview.workload'),
      [ResourceType.NodePool]: getString('ce.overview.nodepool'),
      [ResourceType.EcsService]: getString('ce.overview.ecsService')
    }),
    []
  )

  if (fetching) {
    return (
      <Card elevation={1} className={css.errorContainer}>
        <Icon color="blue500" name="spinner" size={30} />
      </Card>
    )
  }

  if (ccmData && !ccmData.k8sClusterConnectorPresent) {
    return (
      <Card elevation={1} className={css.errorContainer}>
        <OverviewAddCluster
          onAddClusterSuccess={onAddClusterSuccess}
          descriptionText={getString('ce.pageErrorMsg.recommendationDesc')}
        />
      </Card>
    )
  }

  if (ccmData && ccmData.k8sClusterConnectorPresent && !ccmData.clusterDataPresent) {
    return (
      <Card elevation={1} className={css.errorContainer}>
        <img src={EmptyView} />
        <Text className={css.errorText}>{getString('ce.pageErrorMsg.recommendationNoData')}</Text>
      </Card>
    )
  }

  const NameCell: Renderer<CellProps<RecommendationItemDTO>> = cell => {
    const originalRowData = cell.row.original
    const { clusterName, namespace, resourceType } = originalRowData

    const provider = get(originalRowData, 'recommendationDetails.recommended.provider', '')

    const iconMapping: Record<ResourceType, IconName> = {
      [ResourceType.EcsService]: 'service-ecs',
      [ResourceType.NodePool]: getProviderIcon(provider),
      [ResourceType.Workload]: 'app-kubernetes'
    }

    const iconName = iconMapping[resourceType]
    const cloudProvider = CloudProvider.CLUSTER
    const defaultPerspectiveId = (defaultTo(ccmData, {}) as CcmMetaData)['defaultClusterPerspectiveId'] as string

    const clusterLink = useMemo(
      () => ({
        pathname: routes.toPerspectiveDetails({
          accountId: accountId,
          perspectiveId: defaultPerspectiveId,
          perspectiveName: defaultPerspectiveId
        }),
        search: `?${qs.stringify({
          filters: JSON.stringify(generateFilters({ clusterName } as Record<string, string>, cloudProvider)),
          groupBy: JSON.stringify(GROUP_BY_CLUSTER_NAME)
        })}`
      }),
      []
    )

    const namespaceLink = useMemo(
      () => ({
        pathname: routes.toPerspectiveDetails({
          accountId: accountId,
          perspectiveId: defaultPerspectiveId,
          perspectiveName: defaultPerspectiveId
        }),
        search: `?${qs.stringify({
          filters: JSON.stringify(generateFilters({ clusterName, namespace } as Record<string, string>, cloudProvider)),
          groupBy: JSON.stringify(GROUP_BY_CLUSTER_NAME)
        })}`
      }),
      []
    )

    const resourceDetailsLink = useMemo(() => {
      if (resourceType === ResourceType.Workload) {
        return {
          pathname: routes.toCERecommendationWorkloadDetails({
            accountId,
            clusterName: defaultTo(clusterName, ''),
            namespace: defaultTo(namespace, ''),
            recommendation: originalRowData.id,
            recommendationName: originalRowData.resourceName || '',
            workloadName: cell.value
          })
        }
      } else {
        return {
          pathname: routes.toCERecommendationServiceDetails({
            accountId,
            clusterName: defaultTo(clusterName, ''),
            recommendation: originalRowData.id,
            recommendationName: originalRowData.resourceName || '',
            serviceName: cell.value
          })
        }
      }
    }, [])

    const resourceTypeStringKey: Record<ResourceType, keyof StringsMap> = {
      [ResourceType.EcsService]: 'ce.recommendation.listPage.service',
      [ResourceType.NodePool]: 'ce.nodeRecommendation.nodepool',
      [ResourceType.Workload]: 'pipelineSteps.workload'
    }

    return (
      <Layout.Horizontal style={{ alignItems: 'center' }}>
        <Icon name={iconName} size={28} padding={{ right: 'medium' }} />
        <Layout.Vertical style={{ flex: 1 }}>
          <Layout.Horizontal spacing="xsmall" className={css.nameContainer}>
            <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>
              {`${getString('common.cluster')}: `}
            </Text>
            <Link to={clusterLink} onClick={e => e.stopPropagation()}>
              <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.BODY2 }} lineClamp={1}>
                {clusterName}
              </Text>
            </Link>
          </Layout.Horizontal>
          {namespace ? (
            <Layout.Horizontal spacing="xsmall" className={css.nameContainer}>
              <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>
                {`${getString('ce.recommendation.listPage.filters.namespace')}: `}
              </Text>
              <Link to={namespaceLink} onClick={e => e.stopPropagation()}>
                <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.BODY2 }} lineClamp={1}>
                  {namespace}
                </Text>
              </Link>
            </Layout.Horizontal>
          ) : null}
          <Layout.Horizontal spacing="xsmall" className={css.nameContainer}>
            <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL_BOLD }}>
              {`${getString(resourceTypeStringKey[resourceType])}: `}
            </Text>
            {resourceType !== ResourceType.NodePool ? (
              <Link to={resourceDetailsLink} onClick={e => e.stopPropagation()}>
                <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.BODY2 }} lineClamp={1}>
                  {cell.value}
                </Text>
              </Link>
            ) : (
              <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY2 }} lineClamp={1}>
                {cell.value}
              </Text>
            )}
          </Layout.Horizontal>
        </Layout.Vertical>
      </Layout.Horizontal>
    )
  }

  const RecommendationTypeCell: Renderer<CellProps<RecommendationItemDTO>> = ({ row }) => {
    const rowData = row.original
    const { resourceType } = rowData
    return (
      <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }} lineClamp={1}>
        {resourceTypeMap[resourceType]}
      </Text>
    )
  }

  const CostCell: Renderer<CellProps<RecommendationItemDTO>> = cell => {
    return cell.value ? (
      <Text color={Color.GREY_600} font={{ variation: FontVariation.H6 }}>
        {formatCost(cell.value)}
      </Text>
    ) : null
  }

  const SavingCell: Renderer<CellProps<RecommendationItemDTO>> = cell => {
    return !isNaN(cell.value) ? (
      <Container>
        <Text inline color={Color.GREEN_700} font={{ variation: FontVariation.H5 }}>
          {formatCost(cell.value)}
        </Text>
        <Text inline color={Color.GREEN_700} font={{ variation: FontVariation.BODY2 }} margin={{ left: 'small' }}>
          {calculateSavingsPercentage(cell.value, defaultTo(cell.row.original.monthlyCost, 0))}
        </Text>
      </Container>
    ) : null
  }

  return data ? (
    <>
      <Layout.Vertical spacing="large">
        {data.length ? (
          <TableV2<RecommendationItemDTO>
            onRowClick={({ id, resourceType, resourceName, monthlySaving }) => {
              trackEvent(USER_JOURNEY_EVENTS.RECOMMENDATION_CLICK, {
                recommendationID: id,
                monthlySaving
              })
              history.push(
                resourceTypeToRoute[resourceType]({
                  accountId,
                  recommendation: id,
                  recommendationName: resourceName || id
                })
              )
            }}
            data={data}
            columns={[
              {
                accessor: 'resourceName',
                Header: getString('ce.recommendation.listPage.listTableHeaders.resourceName'),
                Cell: NameCell,
                width: '36%'
              },
              {
                accessor: 'monthlySaving',
                Header: getString('ce.recommendation.listPage.listTableHeaders.monthlySavings'),
                Cell: SavingCell,
                width: '18%'
              },
              {
                accessor: 'monthlyCost',
                Header: getString('ce.recommendation.listPage.listTableHeaders.monthlyCost'),
                Cell: CostCell,
                width: '18%'
              },
              {
                Header: getString('ce.recommendation.listPage.listTableHeaders.recommendationType'),
                Cell: RecommendationTypeCell,
                width: '18%'
              }
            ]}
            pagination={pagination}
          ></TableV2>
        ) : (
          <Container className={css.errorContainer}>
            <img src={EmptyView} />
            <Text className={css.errorText}>
              {getString(
                isEmpty(filters) ? 'ce.pageErrorMsg.noRecommendations' : 'ce.pageErrorMsg.noFilteredRecommendations'
              )}
            </Text>
          </Container>
        )}
      </Layout.Vertical>
    </>
  ) : null
}

const RecommendationListPage: React.FC = () => {
  const [page, setPage] = useQueryParamsState('page', 0)

  const { trackPage, trackEvent } = useTelemetry()
  const history = useHistory()
  const { accountId } = useParams<{ accountId: string }>()
  const {
    perspectiveId,
    perspectiveName,
    origin,
    filters: filterQuery = {},
    perspectiveFilters = ''
  } = useQueryParams<{
    perspectiveId: string
    perspectiveName: string
    filters: Record<string, any>
    origin: string
    perspectiveFilters: string
  }>()

  const [selectedFilter, setSelectedFilter] = useQueryParamsState<Partial<FilterDTO>>('filters', {
    identifier: getIdentifierFromName(UNSAVED_FILTER),
    filterProperties: {}
  })
  const [recommendationStats, setRecommendationStats] = useState<RecommendationOverviewStats>()
  const [recommendationCount, setRecommendationCount] = useState<number>()
  const [recommendationList, setRecommendationList] = useState<RecommendationItemDTO[]>([])
  const { getRBACErrorMessage } = useRBACError()
  const perspectiveFiltersParams = perspectiveFilters
    ? JSON.parse(perspectiveFilters)
    : ((perspectiveId ? [getViewFilterForId(perspectiveId)] : []) as QLCEViewFilterWrapper[])

  useEffect(() => {
    trackPage(PAGE_NAMES.RECOMMENDATIONS_PAGE, {})
  }, [])

  const [ccmMetaResult, refetchCCMMetaData] = useFetchCcmMetaDataQuery()
  const { data: ccmData, fetching: fetchingCCMMetaData } = ccmMetaResult

  useDeepCompareEffect(() => {
    if (ccmData?.ccmMetaData && recommendationList.length) {
      trackEvent(USER_JOURNEY_EVENTS.RECOMMENDATION_PAGE_LOADED, {
        clustersNotConfigured: ccmData?.ccmMetaData.k8sClusterConnectorPresent ? 'yes' : 'no',
        count: recommendationList.length
      })
    }
  }, [ccmData, recommendationList])

  const { loading: statsLoading, mutate: fetchRecommendationStats } = useRecommendationStats({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { loading: countLoading, mutate: fetchRecommendationCount } = useRecommendationsCount({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const {
    loading: listLoading,
    mutate: fetchRecommendationList,
    error: recommendationListError
  } = useListRecommendations({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { getString } = useStrings()

  useDocumentTitle(getString('ce.recommendation.sideNavText'))

  const totalMonthlyCost = defaultTo(recommendationStats?.totalMonthlyCost, 0)
  const totalSavings = defaultTo(recommendationStats?.totalMonthlySaving, 0)

  const gotoPage = (pageNumber: number) => setPage(pageNumber)

  const goBackToPerspective: () => void = () => {
    if (origin === CCM_PAGE_TYPE.Workload) {
      const clusterName = filterQuery?.clusterNames?.[0],
        namespace = filterQuery?.namespaces?.[0],
        workloadName = filterQuery?.names?.[0]

      if (clusterName && namespace && workloadName) {
        history.push(
          routes.toCEPerspectiveWorkloadDetails({
            accountId,
            perspectiveId,
            perspectiveName,
            clusterName,
            namespace,
            workloadName
          })
        )
      }
    } else {
      history.push(
        routes.toPerspectiveDetails({
          perspectiveId,
          perspectiveName,
          accountId
        })
      )
    }
  }

  const pagination = {
    itemCount: (recommendationCount || 0) as number,
    pageSize: 10,
    pageCount: recommendationCount ? Math.ceil(recommendationCount / 10) : 0,
    pageIndex: page,
    gotoPage: gotoPage
  }

  const isEmptyView = !listLoading && !recommendationList?.length

  const getRecommendationData = async () => {
    try {
      const [stats, count] = await Promise.all([
        fetchRecommendationStats({
          minSaving: 1,
          ...selectedFilter.filterProperties,
          filterType: 'CCMRecommendation',
          perspectiveFilters: perspectiveFiltersParams
        }),
        fetchRecommendationCount({
          minSaving: 1,
          ...selectedFilter.filterProperties,
          filterType: 'CCMRecommendation',
          perspectiveFilters: perspectiveFiltersParams
        })
      ])

      setRecommendationStats(stats.data)
      setRecommendationCount(count.data)
    } catch (error: any) {
      // showError(getErrorInfoFromErrorObject(error))
    }
  }

  const getRecommendationList = async () => {
    const response = await fetchRecommendationList({
      minSaving: 1,
      ...selectedFilter.filterProperties,
      filterType: 'CCMRecommendation',
      perspectiveFilters: perspectiveFiltersParams,
      offset: page * 10,
      limit: 10
    })

    setRecommendationList(response.data?.items || [])
  }

  useDeepCompareEffect(() => {
    getRecommendationData()
  }, [selectedFilter.filterProperties])

  useDeepCompareEffect(() => {
    getRecommendationList()
  }, [selectedFilter.filterProperties, page])

  const isPageLoading = listLoading || countLoading || statsLoading

  return (
    <>
      <Page.Header
        title={
          <Text
            color="grey800"
            style={{ fontSize: 20, fontWeight: 'bold' }}
            tooltipProps={{ dataTooltipId: 'ccmRecommendations' }}
          >
            {getString('ce.recommendation.sideNavText')}
          </Text>
        }
        breadcrumbs={<NGBreadcrumbs />}
        toolbar={
          perspectiveId ? (
            <Button
              text={getString('ce.recommendation.listPage.backToPerspectives', {
                name: perspectiveName
              })}
              icon="chevron-left"
              onClick={goBackToPerspective}
              variation={ButtonVariation.PRIMARY}
            />
          ) : null
        }
      />
      <Card style={{ width: '100%' }}>
        <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
          <RecommendationFilters
            applyFilters={(filter: Partial<FilterDTO>) => {
              setPage(0)
              setSelectedFilter({ identifier: filter.identifier, filterProperties: filter.filterProperties })
            }}
            appliedFilter={selectedFilter}
          />
        </Layout.Horizontal>
      </Card>
      <Page.Body loading={isPageLoading || fetchingCCMMetaData}>
        {recommendationListError ? (
          <HandleError
            errorMsg={getRBACErrorMessage(recommendationListError as RBACError)}
            imgSrc={PermissionError}
            wrapperClassname={css.permissionErrorWrapper}
          />
        ) : (
          <Container className={css.listContainer}>
            <Layout.Vertical spacing="large">
              <RecommendationCards
                isEmptyView={isEmptyView}
                recommendationCount={defaultTo(recommendationCount, 0)}
                totalMonthlyCost={totalMonthlyCost}
                totalSavings={totalSavings}
              />
              <RecommendationsList
                onAddClusterSuccess={() => {
                  refetchCCMMetaData()
                }}
                ccmData={ccmData?.ccmMetaData}
                pagination={pagination}
                fetching={listLoading || fetchingCCMMetaData}
                data={recommendationList}
                filters={selectedFilter.filterProperties}
              />
            </Layout.Vertical>
          </Container>
        )}
      </Page.Body>
    </>
  )
}

export default RecommendationListPage

interface RecommendationCardsProps {
  isEmptyView: boolean
  recommendationCount: number
  totalMonthlyCost: number
  totalSavings: number
}

const RecommendationCards: React.FC<RecommendationCardsProps> = ({
  isEmptyView,
  recommendationCount,
  totalMonthlyCost,
  totalSavings
}) => {
  const { getString } = useStrings()
  const sustainabilityEnabled = useFeatureFlag(FeatureFlag.CCM_SUSTAINABILITY)

  return (
    <Layout.Horizontal spacing="medium">
      <RecommendationSavingsCard
        title={getString('ce.recommendation.listPage.monthlySavingsText')}
        amount={isEmptyView ? '$-' : formatCost(totalSavings)}
        iconName="money-icon"
        subTitle={getString('ce.recommendation.listPage.recommendationCount', {
          count: recommendationCount
        })}
      />
      {sustainabilityEnabled && (
        <RecommendationSavingsCard
          title={getString('ce.recommendation.listPage.potentialReducedEmissionTitle')}
          titleImg={greenLeafImg}
          amount={
            isEmptyView ? (
              ''
            ) : (
              <String
                stringID="ce.common.emissionUnitHTML"
                vars={{ value: getEmissionsValue(totalSavings) }}
                useRichText
              />
            )
          }
          cardCssName={css.potentialReducedEmissionCard}
          subTitle={getString('ce.recommendation.listPage.potentialReducedEmissionSubtitle', {
            count: recommendationCount || 0
          })}
        />
      )}
      <RecommendationSavingsCard
        title={getString('ce.recommendation.listPage.monthlyPotentialCostText')}
        amount={isEmptyView ? '$-' : formatCost(totalMonthlyCost)}
        amountSubTitle={getString('ce.recommendation.listPage.byEOM')}
        subTitle={getString('ce.recommendation.listPage.forecatedCostSubText')}
      />
      {sustainabilityEnabled && (
        <RecommendationSavingsCard
          title={getString('ce.recommendation.listPage.potentialEmissionTitle')}
          titleImg={grayLeafImg}
          amount={
            isEmptyView ? (
              ''
            ) : (
              <String
                stringID="ce.common.emissionUnitHTML"
                vars={{ value: getEmissionsValue(totalMonthlyCost) }}
                useRichText
              />
            )
          }
          cardCssName={css.potentialEmissionCard}
          amountSubTitle={getString('ce.recommendation.listPage.byEOM')}
          subTitle={getString('ce.recommendation.listPage.forecatedCostSubText')}
        />
      )}
    </Layout.Horizontal>
  )
}
