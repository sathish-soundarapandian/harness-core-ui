/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import type QueryString from 'qs'
import { useParams } from 'react-router-dom'
import type { Renderer, CellProps } from 'react-table'
import {
  Text,
  TableV2,
  Color,
  Layout,
  Page,
  Checkbox,
  Button,
  ButtonVariation,
  ExpandingSearchInput
} from '@harness/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  SLOTargetDTO,
  useGetSLOHealthListView,
  GetSLOHealthListViewQueryParams,
  ServiceLevelObjectiveDetailsDTO,
  SLOHealthListView
} from 'services/cv'
import { useStrings } from 'framework/strings'
import css from './SLOList.module.scss'

interface SLODashboardWidgetsParams {
  queryParams: GetSLOHealthListViewQueryParams
  queryParamStringifyOptions: QueryString.IStringifyOptions
}

interface SLOListProps {
  hideDrawer: () => void
  filter: SLOTargetDTO['type']
  onAddSLO: (key: string, value: ServiceLevelObjectiveDetailsDTO[]) => void
  serviceLevelObjectivesDetails: ServiceLevelObjectiveDetailsDTO[]
}

export const SLOList = ({ filter, onAddSLO, serviceLevelObjectivesDetails, hideDrawer }: SLOListProps): JSX.Element => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [pageNumber, setPageNumber] = useState(0)
  const [selectedSlos, setSelectedSlos] = useState<SLOHealthListView[]>([])

  const sloDashboardWidgetsParams: SLODashboardWidgetsParams = {
    queryParams: { accountId, orgIdentifier, projectIdentifier, pageNumber, pageSize: 10, targetTypes: [filter!] },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  }

  const {
    data: dashboardWidgetsResponse,
    loading: dashboardWidgetsLoading,
    refetch: refetchDashboardWidgets,
    error: dashboardWidgetsError
  } = useGetSLOHealthListView(sloDashboardWidgetsParams)

  const { content, totalItems = 0, totalPages = 0, pageIndex = 0, pageSize = 10 } = dashboardWidgetsResponse?.data ?? {}

  useEffect(() => {
    // load selected SLOs when we get data from API
    if (dashboardWidgetsResponse?.data?.content) {
      const filteredList = dashboardWidgetsResponse?.data?.content.filter(item =>
        serviceLevelObjectivesDetails.map(details => details.serviceLevelObjectiveRef).includes(item.sloIdentifier)
      )
      setSelectedSlos(filteredList)
    }
  }, [dashboardWidgetsResponse?.data?.content])

  const addSLos = (): void => {
    const selectedSlosLength = selectedSlos.length
    const weight = Number(100 / selectedSlosLength).toFixed(1)
    const lastWeight = Number(100 - Number(weight) * (selectedSlosLength - 1)).toFixed(1)
    const updatedSLOObjective = selectedSlos.map((item, index) => {
      return {
        serviceLevelObjectiveRef: item?.sloIdentifier,
        weightagePercentage: index === selectedSlosLength - 1 ? Number(lastWeight) : Number(weight)
      }
    })
    onAddSLO('serviceLevelObjectivesDetails', updatedSLOObjective)
    hideDrawer()
  }

  const RenderSLOName: Renderer<CellProps<SLOHealthListView>> = ({ row }) => {
    const slo = row?.original
    const { name = '', description = '' } = slo || {}

    return (
      <>
        <Text color={Color.PRIMARY_7} title={name} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
          {name}
        </Text>
        <Text title={name} font={{ align: 'left', size: 'small' }}>
          {description}
        </Text>
      </>
    )
  }

  const RenderMonitoredService: Renderer<CellProps<SLOHealthListView>> = ({ row }) => {
    const slo = row?.original
    const { serviceName = '', environmentIdentifier = '' } = slo || {}

    return (
      <Layout.Vertical padding={{ left: 'small' }}>
        <>
          <Text
            color={Color.PRIMARY_7}
            className={css.titleInSloTable}
            title={serviceName}
            font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}
          >
            {serviceName}
          </Text>
        </>
        <>
          <Text color={Color.PRIMARY_7} title={environmentIdentifier} font={{ align: 'left', size: 'xsmall' }}>
            {environmentIdentifier}
          </Text>
        </>
      </Layout.Vertical>
    )
  }

  const RenderUserJourney: Renderer<CellProps<SLOHealthListView>> = ({ row }) => {
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

  const RenderTarget: Renderer<CellProps<SLOHealthListView>> = ({ row }) => {
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

  const onSelectCheckBox = (checked: boolean, slo: SLOHealthListView): void => {
    const clonedSelectedSlos = [...selectedSlos]
    if (checked) {
      clonedSelectedSlos.push(slo)
      setSelectedSlos(clonedSelectedSlos)
    } else {
      setSelectedSlos(clonedSelectedSlos.filter(item => item.name !== slo.name))
    }
  }

  const RenderCheckBoxes: Renderer<CellProps<SLOHealthListView>> = ({ row }) => {
    const sloData = row.original
    const isChecked = Boolean([...selectedSlos].find(item => item.name === sloData.name))
    return (
      <Checkbox
        checked={isChecked}
        onChange={(event: React.FormEvent<HTMLInputElement>) => {
          onSelectCheckBox(event.currentTarget.checked, sloData)
        }}
      />
    )
  }

  return (
    <>
      <Page.Header
        title={
          <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
            <Text>SLOs matching the time window.</Text>
            <ExpandingSearchInput alwaysExpanded width={250} />
          </Layout.Horizontal>
        }
      />

      <Page.Body
        loading={dashboardWidgetsLoading}
        error={dashboardWidgetsError}
        retryOnError={() => refetchDashboardWidgets()}
      >
        <TableV2
          sortable={false}
          columns={[
            {
              Header: '',
              id: 'selectSlo',
              Cell: RenderCheckBoxes
            },
            {
              Header: getString('cv.slos.sloName').toUpperCase(),
              Cell: RenderSLOName
            },
            {
              Header: getString('cv.slos.monitoredService').toUpperCase(),
              Cell: RenderMonitoredService
            },
            {
              Header: getString('cv.slos.target').toUpperCase(),
              Cell: RenderTarget
            },
            {
              Header: getString('cv.slos.userJourney').toUpperCase(),
              Cell: RenderUserJourney
            }
          ]}
          data={content || []}
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
        <Button variation={ButtonVariation.SECONDARY} text={'Add'} onClick={addSLos} />
      </Page.Body>
    </>
  )
}
