/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction, useState } from 'react'
import type { CellProps, Column, Renderer } from 'react-table'
import { Text, Icon, TableV2, Layout, Button } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import qs from 'qs'
import { Link, useParams } from 'react-router-dom'
import { Classes, IconName, Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { AnomalyData, useReportAnomalyFeedback } from 'services/ce'
import { ANOMALIES_LIST_FORMAT, getTimePeriodString } from '@ce/utils/momentUtils'
import formatCost from '@ce/utils/formatCost'
import { useToaster } from '@common/components'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { CcmMetaData, useFetchCcmMetaDataQuery } from 'services/ce/services'
import type { orderType, sortType, serverSortProps } from '@common/components/Table/react-table-config'
import { generateFilters, generateGroupBy } from '@ce/utils/anomaliesUtils'
import type { CloudProvider, TimeRangeFilterType } from '@ce/types'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import css from '../../pages/anomalies-overview/AnomaliesOverviewPage.module.scss'

const getResourceIcon = (cloudProvider: string) => {
  switch (cloudProvider) {
    case 'CLUSTER':
      return 'service-kubernetes'

    case 'AWS':
      return 'service-aws'

    case 'AZURE':
      return 'service-azure'

    case 'GCP':
      return 'gcp'

    /* istanbul ignore next */
    default:
      return 'harness'
  }
}

interface SortByObjInterface {
  sort?: sortType
  order?: orderType
}
interface ListProps {
  listData: AnomalyData[] | null
  sortByObj: SortByObjInterface
  setSortByObj: Dispatch<SetStateAction<SortByObjInterface>>
  timeRange: TimeRangeFilterType
}

interface AnomaliesMenu {
  anomalyId: string
}

const AnomaliesMenu: React.FC<AnomaliesMenu> = ({ anomalyId }) => {
  const { getString } = useStrings()
  const [isOpen, setIsOpen] = useState(false)
  const { accountId } = useParams<AccountPathProps>()
  const { mutate: updateAnomalyFeedback } = useReportAnomalyFeedback({
    queryParams: {
      accountIdentifier: accountId,
      anomalyId: anomalyId
    }
  })
  const { getRBACErrorMessage } = useRBACError()
  const { showError, showSuccess } = useToaster()
  const isDevFeature = useFeatureFlag(FeatureFlag.CCM_DEV_TEST)

  const anomalyFeedback = async () => {
    try {
      const response = await updateAnomalyFeedback({
        feedback: 'FALSE_ANOMALY'
      })
      response && showSuccess(getString('ce.anomalyDetection.userFeedbackSuccessMsg'))
    } catch (error) {
      showError(getRBACErrorMessage(error))
    }
  }

  return (
    <Popover
      isOpen={isOpen}
      onInteraction={nextOpenState => {
        setIsOpen(nextOpenState)
      }}
      className={Classes.DARK}
      position={Position.RIGHT_TOP}
      usePortal={false}
    >
      <Button
        minimal
        icon="Options"
        onClick={e => {
          e.stopPropagation()
          setIsOpen(true)
        }}
      />
      <Menu>
        {isDevFeature ? (
          <MenuItem
            text={getString('ce.anomalyDetection.tableMenu.whitelistResource')}
            onClick={(e: any) => {
              e.stopPropagation()
              setIsOpen(false)
            }}
          />
        ) : /* istanbul ignore next */ null}
        <MenuItem
          text={getString('ce.anomalyDetection.tableMenu.falseAnomaly')}
          onClick={(e: any) => {
            e.stopPropagation()
            setIsOpen(false)
            anomalyFeedback()
          }}
        />
      </Menu>
    </Popover>
  )
}

const getServerSortProps = ({
  enableServerSort,
  accessor,
  sortByObj,
  setSortByObj
}: {
  enableServerSort: boolean
  accessor: string
  sortByObj: SortByObjInterface
  setSortByObj: Dispatch<SetStateAction<SortByObjInterface>>
}): serverSortProps => {
  if (!enableServerSort) {
    return { enableServerSort: false }
  } else {
    let newOrder: orderType | undefined
    const sortName = accessor

    /* istanbul ignore next */
    if (sortName === sortByObj.sort && sortByObj.order) {
      newOrder = sortByObj.order === 'DESC' ? 'ASC' : 'DESC'
    } else {
      // no saved state for sortBy of the same sort type
      newOrder = 'ASC'
    }

    return {
      enableServerSort: true,
      isServerSorted: sortByObj.sort === accessor,
      isServerSortedDesc: sortByObj.order === 'DESC',
      getSortedColumn: ({ sort }: { sort?: sortType }) => {
        setSortByObj({ sort, order: newOrder })
      }
    }
  }
}

const AnomaliesListGridView: React.FC<ListProps> = ({ listData, sortByObj, setSortByObj, timeRange }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()

  const DateCell: Renderer<CellProps<AnomalyData>> = ({ row }) => {
    const timestamp = row.original.time as number
    const relativeTime = row.original.anomalyRelativeTime

    return (
      <Layout.Vertical spacing="small">
        <Text color={Color.BLACK} font={{ variation: FontVariation.BODY2 }}>
          {getTimePeriodString(timestamp, ANOMALIES_LIST_FORMAT)}
        </Text>
        <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }}>
          {relativeTime}
        </Text>
      </Layout.Vertical>
    )
  }

  const CostCell: Renderer<CellProps<AnomalyData>> = ({ row }) => {
    const actualAmount = row.original.anomalousSpend as number
    const trend = row.original.anomalousSpendPercentage

    return (
      <Layout.Horizontal style={{ alignItems: 'baseline' }} spacing="small">
        <Text font={{ variation: FontVariation.BODY2 }} color={Color.BLACK}>
          {formatCost(actualAmount)}
        </Text>
        {trend ? (
          <Text font={{ variation: FontVariation.TINY }} color={Color.RED_600}>
            {getString('ce.anomalyDetection.trend', {
              trend: trend
            })}
          </Text>
        ) : /* istanbul ignore next */ null}
      </Layout.Horizontal>
    )
  }

  const map: Record<string, string> = {
    AZURE: 'defaultAzurePerspectiveId',
    AWS: 'defaultAwsPerspectiveId',
    GCP: 'defaultGcpPerspectiveId',
    CLUSTER: 'defaultClusterPerspectiveId'
  }

  const ResourceCell: Renderer<CellProps<AnomalyData>> = ({ row }) => {
    const resourceName = row.original.resourceName
    const resourceInfo = row.original.resourceInfo
    /* istanbul ignore next */
    const cloudProvider = row.original.cloudProvider || ''

    const [ccmMetaResult] = useFetchCcmMetaDataQuery()
    const { data: ccmData } = ccmMetaResult
    /* istanbul ignore next */
    const ccmMetaData = (ccmData?.ccmMetaData || {}) as CcmMetaData
    const mapping = map[cloudProvider]

    const entity = row.original.entity

    return (
      <Layout.Horizontal style={{ alignItems: 'center' }}>
        <Icon name={getResourceIcon(cloudProvider) as IconName} size={24} />
        <Layout.Vertical spacing="small">
          <Link
            to={{
              pathname: routes.toPerspectiveDetails({
                accountId: accountId,
                perspectiveId: ccmMetaData[mapping as keyof CcmMetaData] as string,
                perspectiveName: ccmMetaData[mapping as keyof CcmMetaData] as string
              }),
              search: `?${qs.stringify({
                filters: entity
                  ? JSON.stringify(generateFilters(entity as Record<string, string>, cloudProvider as CloudProvider))
                  : /* istanbul ignore next */
                    [],
                groupBy: JSON.stringify(
                  /* istanbul ignore next */ generateGroupBy((entity as any)?.field, cloudProvider as CloudProvider)
                ),
                timeRange: JSON.stringify(timeRange)
              })}`
            }}
          >
            <Text
              font={{ variation: FontVariation.SMALL }}
              inline
              color={Color.PRIMARY_7}
              lineClamp={1}
              style={{ maxWidth: 200 }}
            >
              {resourceName}
            </Text>
          </Link>
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
            {resourceInfo}
          </Text>
        </Layout.Vertical>
      </Layout.Horizontal>
    )
  }

  const StatusCell: Renderer<CellProps<AnomalyData>> = ({ row }) => {
    const status = row.original.status
    const stausRelativeTime = row.original.statusRelativeTime

    return (
      <Layout.Vertical spacing="small">
        <Text font={{ variation: FontVariation.BODY }} color={Color.ORANGE_700}>
          {status}
        </Text>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
          {stausRelativeTime}
        </Text>
      </Layout.Vertical>
    )
  }

  const MenuCell: Renderer<CellProps<AnomalyData>> = ({ row }) => {
    return <AnomaliesMenu anomalyId={row.original.id || /* istanbul ignore next */ ''} />
  }

  const columns: Column<AnomalyData>[] = React.useMemo(
    () => [
      {
        Header: (
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
            {getString('ce.anomalyDetection.tableHeaders.date')}
          </Text>
        ),
        accessor: 'time',
        Cell: DateCell,
        width: '20%',
        serverSortProps: getServerSortProps({
          enableServerSort: true,
          accessor: 'TIME',
          sortByObj,
          setSortByObj
        })
      },
      {
        Header: (
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
            {getString('ce.anomalyDetection.tableHeaders.anomalousSpend')}
          </Text>
        ),
        accessor: 'actualAmount',
        Cell: CostCell,
        width: '20%',
        serverSortProps: getServerSortProps({
          enableServerSort: true,
          accessor: 'ACTUAL_COST',
          sortByObj,
          setSortByObj
        })
      },
      {
        Header: (
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
            {getString('ce.anomalyDetection.tableHeaders.resource')}
          </Text>
        ),
        accessor: 'resourceName',
        Cell: ResourceCell,
        width: '35%'
      },
      {
        Header: (
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
            {getString('ce.anomalyDetection.tableHeaders.status')}
          </Text>
        ),
        accessor: 'status',
        Cell: StatusCell,
        width: '20%',
        serverSortProps: getServerSortProps({
          enableServerSort: true,
          accessor: 'STATUS',
          sortByObj,
          setSortByObj
        })
      },
      {
        Header: ' ',
        width: '5%',
        Cell: MenuCell
      }
    ],
    [timeRange.to, timeRange.from]
  )

  /* istanbul ignore next */
  if (!listData || !listData.length) {
    return null
  }

  return (
    <TableV2
      className={css.tableView}
      columns={columns}
      data={listData}
      pagination={{
        itemCount: listData.length,
        pageCount: 0,
        pageIndex: 0,
        pageSize: 10
      }}
    />
  )
}

export default AnomaliesListGridView
