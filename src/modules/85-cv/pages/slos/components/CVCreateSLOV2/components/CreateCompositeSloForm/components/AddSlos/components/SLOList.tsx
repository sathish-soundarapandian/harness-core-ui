/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import type QueryString from 'qs'
import { useParams } from 'react-router-dom'
import type { Row } from 'react-table'
import { Text, TableV2, Page, Button, Container, ButtonVariation, ExpandingSearchInput } from '@harness/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  SLOTargetDTO,
  useGetSLOHealthListView,
  GetSLOHealthListViewQueryParams,
  ServiceLevelObjectiveDetailsDTO,
  SLOHealthListView
} from 'services/cv'
import { useStrings } from 'framework/strings'
import {
  getUpdatedSLOObjectives,
  RenderCheckBoxes,
  RenderMonitoredService,
  RenderSLOName,
  RenderTags,
  RenderTarget,
  RenderUserJourney
} from './SLOList.utils'

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
    const updatedSLOObjective = getUpdatedSLOObjectives(selectedSlos, accountId, orgIdentifier, projectIdentifier)
    onAddSLO('serviceLevelObjectivesDetails', updatedSLOObjective)
    hideDrawer()
  }

  return (
    <>
      <Page.Header
        title={<Text>SLOs matching the time window.</Text>}
        toolbar={<ExpandingSearchInput alwaysExpanded width={250} />}
      />
      <Container margin={'medium'}>
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
                width: '50px',
                Cell: ({ row }: { row: Row<SLOHealthListView> }) => {
                  return <RenderCheckBoxes row={row} selectedSlos={selectedSlos} setSelectedSlos={setSelectedSlos} />
                }
              },
              {
                Header: getString('cv.slos.sloName').toUpperCase(),
                width: '20%',
                Cell: RenderSLOName
              },
              {
                Header: getString('cv.slos.monitoredService').toUpperCase(),
                width: '20%',
                Cell: RenderMonitoredService
              },
              {
                Header: getString('cv.slos.userJourney').toUpperCase(),
                width: '20%',
                Cell: RenderUserJourney
              },
              {
                Header: getString('tagsLabel').toUpperCase(),
                width: '20%',
                Cell: RenderTags
              },
              {
                Header: getString('cv.slos.target').toUpperCase(),
                width: '20%',
                Cell: RenderTarget
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
          <Button
            width={150}
            data-testid={'addSloButton'}
            disabled={selectedSlos.length < 2}
            variation={ButtonVariation.PRIMARY}
            text={getString('add')}
            onClick={addSLos}
          />
        </Page.Body>
      </Container>
    </>
  )
}
