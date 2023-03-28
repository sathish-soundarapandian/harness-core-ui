/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react'
import type QueryString from 'qs'
import { useParams } from 'react-router-dom'
import type { Column, Row } from 'react-table'
import {
  Text,
  TableV2,
  Page,
  Button,
  Container,
  ButtonVariation,
  ExpandingSearchInput,
  NoDataCard,
  Layout,
  Checkbox
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useMutateAsGet } from '@common/hooks'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import noServiceAvailableImage from '@cv/assets/noMonitoredServices.svg'
import {
  getProjectAndOrgColumn,
  getColumsForProjectAndAccountLevel
} from '@cv/pages/slos/components/CVCreateSLOV2/components/CreateCompositeSloForm/CreateCompositeSloForm.utils'
import { SLOObjective, SLOV2FormFields } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { getSLOIdentifierWithOrgAndProject } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.utils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useGetSLOHealthListViewV2,
  GetSLOHealthListViewQueryParams,
  ServiceLevelObjectiveDetailsDTO,
  SLOHealthListView,
  SLODashboardApiFilter
} from 'services/cv'
import { useStrings } from 'framework/strings'
import {
  getIsIntermediate,
  getIsSelectAllChecked,
  getSelectedSLOsHaveRefIds,
  getSelectedSLOsHavingSLOIdentifier,
  getUpdatedSLOObjectives,
  RenderCheckBoxes,
  RenderMonitoredService,
  RenderSLIType,
  RenderSLOName,
  RenderTags,
  RenderTarget,
  RenderUserJourney
} from './SLOList.utils'
import { MinNumberOfSLO, MaxNumberOfSLO } from '../../../CreateCompositeSloForm.constant'
import { INITIAL_PAGE_NUMBER } from './SLOList.constants'

interface SLODashboardWidgetsParams {
  queryParams: GetSLOHealthListViewQueryParams
  queryParamStringifyOptions: QueryString.IStringifyOptions
}

interface SLOListProps {
  hideDrawer: () => void
  filter: SLODashboardApiFilter
  onAddSLO: (key: string, value: ServiceLevelObjectiveDetailsDTO[]) => void
  serviceLevelObjectivesDetails: SLOObjective[]
}

export const SLOList = ({ filter, onAddSLO, hideDrawer, serviceLevelObjectivesDetails }: SLOListProps): JSX.Element => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const isAccountLevel = !orgIdentifier && !projectIdentifier && !!accountId
  const { getString } = useStrings()
  const [pageNumber, setPageNumber] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const initializedOnce = useRef(false)
  const [selectedSlos, setSelectedSlos] = useState<SLOHealthListView[]>([])

  const childResource = isAccountLevel ? { childResource: true } : {}
  const sloDashboardWidgetsParams: SLODashboardWidgetsParams = {
    queryParams: { accountId, orgIdentifier, projectIdentifier, pageNumber, pageSize: 10 },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  }

  const {
    data: dashboardWidgetsResponse,
    loading: dashboardWidgetsLoading,
    refetch: refetchDashboardWidgets,
    error: dashboardWidgetsError
  } = useMutateAsGet(useGetSLOHealthListViewV2, {
    queryParams: { ...sloDashboardWidgetsParams.queryParams },
    body: { ...filter, searchFilter: searchTerm, ...childResource }
  })

  const {
    content,
    totalItems = 0,
    totalPages = 0,
    pageIndex = INITIAL_PAGE_NUMBER,
    pageSize = 10
  } = dashboardWidgetsResponse?.data ?? {}
  const isDisabled = selectedSlos?.length < MinNumberOfSLO || selectedSlos?.length > MaxNumberOfSLO
  useEffect(() => {
    // load selected SLOs when we get data from API
    if (content) {
      if (pageIndex === INITIAL_PAGE_NUMBER && !initializedOnce.current && serviceLevelObjectivesDetails.length) {
        const { selectedSlosOnPage, selectedSlosNotOnPage } = getSelectedSLOsHaveRefIds(
          isAccountLevel,
          content,
          serviceLevelObjectivesDetails
        )
        setSelectedSlos([...selectedSlosOnPage, ...selectedSlosNotOnPage] as SLOHealthListView[])
        initializedOnce.current = true
      } else {
        setSelectedSlos(prvSelected => {
          const { selectedSlosNotOnPage, selectedSlosOnPage } = getSelectedSLOsHavingSLOIdentifier(
            isAccountLevel,
            content,
            prvSelected
          )
          return [...selectedSlosNotOnPage, ...selectedSlosOnPage]
        })
      }
    }
  }, [content])

  const addSLos = (): void => {
    const updatedSLOObjective = getUpdatedSLOObjectives(selectedSlos, accountId, orgIdentifier, projectIdentifier)
    onAddSLO(SLOV2FormFields.SERVICE_LEVEL_OBJECTIVES_DETAILS, updatedSLOObjective)
    hideDrawer()
  }

  const isSelectAllChecked = useMemo(
    () => getIsSelectAllChecked(dashboardWidgetsResponse?.data?.content ?? [], selectedSlos),
    [dashboardWidgetsResponse?.data?.content, selectedSlos]
  )

  const isIntermediate = useMemo(
    () => getIsIntermediate(dashboardWidgetsResponse?.data?.content ?? [], selectedSlos),
    [dashboardWidgetsResponse?.data?.content, selectedSlos]
  )

  const onSelectAll = (checked: boolean) => {
    setSelectedSlos(prvSelected => {
      const listOfSloIdsOnPage = dashboardWidgetsResponse?.data?.content?.map(item => item.sloIdentifier)
      const prevSelectedSlosNotOnPage = prvSelected.filter(item => !listOfSloIdsOnPage?.includes(item.sloIdentifier))
      if (checked) {
        return [...prevSelectedSlosNotOnPage, ...(dashboardWidgetsResponse?.data?.content || [])]
      } else {
        return prevSelectedSlosNotOnPage
      }
    })
  }

  const allColumns = [
    {
      Header: (
        <Checkbox
          checked={isSelectAllChecked}
          indeterminate={isIntermediate}
          onChange={(event: React.FormEvent<HTMLInputElement>) => {
            onSelectAll(event.currentTarget.checked)
          }}
        />
      ),
      id: 'selectSlo',
      width: '50px',
      Cell: ({ row }: { row: Row<SLOHealthListView> }) => {
        const sloData = row.original
        const isChecked = isAccountLevel
          ? selectedSlos.some(
              item => getSLOIdentifierWithOrgAndProject(item) === getSLOIdentifierWithOrgAndProject(sloData)
            )
          : selectedSlos.some(item => item.name === sloData.name)
        return (
          <RenderCheckBoxes
            row={row}
            isChecked={isChecked}
            selectedSlos={selectedSlos}
            setSelectedSlos={setSelectedSlos}
            isAccountLevel={isAccountLevel}
          />
        )
      }
    },
    {
      Header: getString('cv.slos.sloName').toUpperCase(),
      Cell: RenderSLOName
    },
    ...(getProjectAndOrgColumn({ getString }) as Column<SLOHealthListView>[]),
    {
      Header: getString('cv.slos.monitoredService').toUpperCase(),
      Cell: RenderMonitoredService,
      width: '17%'
    },
    {
      Header: getString('cv.slos.userJourney').toUpperCase(),
      Cell: RenderUserJourney,
      width: '15%'
    },
    {
      Header: getString('tagsLabel').toUpperCase(),
      Cell: RenderTags,
      width: '10%'
    },
    {
      Header: getString('cv.slos.sliType'),
      Cell: RenderSLIType,
      width: '15%'
    },
    {
      Header: getString('cv.slos.target').toUpperCase(),
      Cell: RenderTarget,
      width: '15%'
    }
  ]

  const filteredColumns = getColumsForProjectAndAccountLevel({ isAccountLevel, allColumns, getString })

  return (
    <>
      <Text margin={'medium'} font={{ variation: FontVariation.FORM_TITLE }}>
        {getString('cv.CompositeSLO.AddSLO')}
      </Text>
      <Layout.Vertical margin={'medium'} border={{ bottom: true }} padding={{ bottom: 'small' }}>
        <Text font={{ variation: FontVariation.FORM_LABEL, weight: 'light' }}>
          {getString('cv.CompositeSLO.MatchingSLO')}
        </Text>
        <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }} width="97%">
          <Text font={{ variation: FontVariation.FORM_LABEL, weight: 'bold' }}>
            {selectedSlos.length}/20 {getString('cd.selectedLabel')}
          </Text>
          <ExpandingSearchInput
            alwaysExpanded
            width={250}
            onChange={text => {
              setPageNumber(0)
              setSearchTerm(text.trim())
            }}
          />
        </Layout.Horizontal>
      </Layout.Vertical>
      <Container margin={'medium'}>
        <Page.Body
          loading={dashboardWidgetsLoading}
          error={getErrorMessage(dashboardWidgetsError)}
          retryOnError={() => refetchDashboardWidgets()}
        >
          {content?.length ? (
            <TableV2
              sortable
              columns={filteredColumns as Array<Column<SLOHealthListView>>}
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
          ) : (
            <NoDataCard
              image={noServiceAvailableImage}
              message={
                <>
                  <Text font={{ variation: FontVariation.H6 }}>{getString('cv.CompositeSLO.NoData')}</Text>
                  <Text font={{ variation: FontVariation.FORM_LABEL, weight: 'light' }}>
                    {getString('cv.CompositeSLO.NoDataSuggestion')}
                  </Text>
                </>
              }
            />
          )}
          <Container border={{ top: true }} padding={{ top: 'medium' }}>
            <Button
              width={150}
              data-testid={'addSloButton'}
              disabled={isDisabled}
              variation={ButtonVariation.PRIMARY}
              text={serviceLevelObjectivesDetails.length ? getString('update') : getString('add')}
              onClick={addSLos}
            />
          </Container>
        </Page.Body>
      </Container>
    </>
  )
}
