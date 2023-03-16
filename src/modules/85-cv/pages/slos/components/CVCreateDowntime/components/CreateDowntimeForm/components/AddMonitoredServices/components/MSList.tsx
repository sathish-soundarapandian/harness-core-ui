/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import type { Column, Row } from 'react-table'
import {
  Text,
  TableV2,
  Page,
  Container,
  ExpandingSearchInput,
  NoDataCard,
  Layout,
  Checkbox,
  Heading,
  Button,
  ButtonVariation,
  MultiSelect,
  MultiSelectOption,
  Label
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { getErrorMessage, prepareFilterInfo } from '@cv/utils/CommonUtils'
import noServiceAvailableImage from '@cv/assets/noMonitoredServices.svg'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  MonitoredServiceDetail,
  MonitoredServiceListItemDTO,
  useGetMonitoredServiceListEnvironments,
  useListMonitoredService
} from 'services/cv'
import { useStrings } from 'framework/strings'
import { DowntimeFormFields } from '@cv/pages/slos/components/CVCreateDowntime/CVCreateDowntime.types'
import {
  getEnvironmentOptions,
  getIsIntermediate,
  getIsSelectAllChecked,
  getMonitoredServiceDetail,
  RenderCheckBoxes,
  RenderEnvironmentName,
  RenderMSName,
  RenderSLOsAssigned,
  RenderTags
} from './MSList.utils'

interface MSListProps {
  hideDrawer: () => void
  onAddMS: (key: string, value: MonitoredServiceDetail[]) => void
  msList: MonitoredServiceDetail[]
}

const MSList = ({ onAddMS, hideDrawer, msList }: MSListProps): JSX.Element => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const pathParams = {
    accountId,
    orgIdentifier,
    projectIdentifier
  }
  const { getString } = useStrings()
  const [pageNumber, setPageNumber] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const initializedOnce = useRef(false)
  const [selectedMSs, setSelectedMSs] = useState<MonitoredServiceDetail[]>([])
  const [environmentOptions, setEnvironmentOptions] = useState<MultiSelectOption[]>([])

  const { data: environmentDataList, loading: loadingEnvironments } = useGetMonitoredServiceListEnvironments({
    queryParams: pathParams
  })

  const queryParams = useMemo(
    () => ({
      offset: pageNumber,
      pageSize: 10,
      filter: searchTerm,
      environmentIdentifiers: prepareFilterInfo(environmentOptions) as string[],
      servicesAtRiskFilter: false
    }),
    [pageNumber, searchTerm, environmentOptions]
  )

  const {
    data: monitoredServiceListData,
    loading: monitoredServiceListLoading,
    refetch: refetchMonitoredServiceList,
    error: monitoredServiceListError
  } = useListMonitoredService({
    queryParams: {
      ...pathParams,
      ...queryParams
    },
    lazy: true,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  const { content, totalItems = 0, totalPages = 0, pageIndex = 0, pageSize = 10 } = monitoredServiceListData?.data ?? {}

  useEffect(() => {
    if (content) {
      if (pageIndex === 0 && !initializedOnce.current && msList.length) {
        const selectedMSsOnPage = content
          .filter(item => msList.map(ref => ref.monitoredServiceIdentifier).includes(item.identifier))
          .map(msListItemDTO => getMonitoredServiceDetail(msListItemDTO))
        const selectedMSsNotOnPage = msList.filter(
          item => !selectedMSsOnPage.map(ms => ms.monitoredServiceIdentifier).includes(item.monitoredServiceIdentifier)
        )
        setSelectedMSs([...selectedMSsOnPage, ...selectedMSsNotOnPage])
        initializedOnce.current = true
      } else {
        setSelectedMSs(prvSelected => {
          const listOfMSIdsOnPage = content.map(item => item.identifier)
          const selectedMSsNotOnPage = prvSelected.filter(
            item => !listOfMSIdsOnPage.includes(item.monitoredServiceIdentifier)
          )
          const selectedMSsOnPage = prvSelected.filter(item =>
            listOfMSIdsOnPage.includes(item.monitoredServiceIdentifier)
          )
          return [...selectedMSsNotOnPage, ...selectedMSsOnPage]
        })
      }
    }
  }, [content])

  useEffect(() => {
    refetchMonitoredServiceList({
      queryParams: {
        ...pathParams,
        ...queryParams
      },
      queryParamStringifyOptions: {
        arrayFormat: 'repeat'
      }
    })
  }, [queryParams])

  const addMonitoredServices = (): void => {
    onAddMS(DowntimeFormFields.MS_LIST, selectedMSs)
    hideDrawer()
  }

  const isSelectAllChecked = useMemo(() => getIsSelectAllChecked(content ?? [], selectedMSs), [content, selectedMSs])

  const isIntermediate = useMemo(() => getIsIntermediate(content ?? [], selectedMSs), [content, selectedMSs])

  const onSelectAll = (checked: boolean): void => {
    setSelectedMSs(prvSelected => {
      const listOfMSIdsOnPage = content?.map(item => item.identifier)
      const prevSelectedMSsNotOnPage = prvSelected.filter(
        item => !listOfMSIdsOnPage?.includes(item.monitoredServiceIdentifier)
      )
      if (checked) {
        return [...prevSelectedMSsNotOnPage, ...(content?.map(item => getMonitoredServiceDetail(item)) || [])]
      } else {
        return prevSelectedMSsNotOnPage
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
      id: 'selectMS',
      width: '50px',
      Cell: ({ row }: { row: Row<MonitoredServiceListItemDTO> }) => {
        return <RenderCheckBoxes row={row} selectedMSs={selectedMSs} setSelectedMSs={setSelectedMSs} />
      }
    },
    {
      Header: getString('cv.monitoredServices.heading').toUpperCase(),
      width: '32%',
      Cell: RenderMSName
    },
    {
      Header: getString('environment').replace(/'/g, ''),
      width: '21%',
      Cell: RenderEnvironmentName
    },
    {
      Header: getString('tagsLabel').toUpperCase(),
      width: '25%',
      Cell: RenderTags
    },
    {
      Header: getString('cv.sloDowntime.numberOfSLOs'),
      width: '22%',
      Cell: RenderSLOsAssigned
    }
  ]

  return (
    <>
      <Page.Header
        title={
          <Heading level={4} font={{ variation: FontVariation.H4 }}>
            {getString('cv.sloDowntime.selectMonitoredServices')}
          </Heading>
        }
        toolbar={
          <Layout.Horizontal spacing="medium">
            <Button
              variation={ButtonVariation.PRIMARY}
              text={getString('filters.apply')}
              disabled={monitoredServiceListLoading || !selectedMSs.length}
              onClick={addMonitoredServices}
            />
            <Button text={getString('cancel')} onClick={hideDrawer} variation={ButtonVariation.TERTIARY} />
          </Layout.Horizontal>
        }
      />
      <Container margin={'large'}>
        <Layout.Horizontal
          flex={{ justifyContent: 'space-between', alignItems: 'flex-end' }}
          padding={{ top: 'medium', bottom: 'small' }}
        >
          <Container width={320}>
            <Label>{getString('environment').replace(/'/g, '')}</Label>
            <MultiSelect
              value={environmentOptions}
              items={getEnvironmentOptions(environmentDataList, loadingEnvironments, getString)}
              placeholder={getString('all')}
              onChange={item => {
                setEnvironmentOptions(item)
                setPageNumber(0)
              }}
            />
          </Container>
          <ExpandingSearchInput
            alwaysExpanded
            width={250}
            onChange={text => {
              setPageNumber(0)
              setSearchTerm(text.trim())
            }}
          />
        </Layout.Horizontal>
        <Page.Body
          loading={monitoredServiceListLoading}
          error={getErrorMessage(monitoredServiceListError)}
          retryOnError={() => refetchMonitoredServiceList()}
        >
          {content?.length ? (
            <TableV2
              sortable
              columns={allColumns as Array<Column<MonitoredServiceListItemDTO>>}
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
          ) : (
            <NoDataCard
              image={noServiceAvailableImage}
              message={
                <>
                  <Text font={{ variation: FontVariation.H6 }}>{getString('cv.sloDowntime.NoData')}</Text>
                  <Text font={{ variation: FontVariation.FORM_LABEL, weight: 'light' }}>
                    {getString('cv.sloDowntime.NoDataSuggestion')}
                  </Text>
                </>
              }
            />
          )}
        </Page.Body>
      </Container>
    </>
  )
}

export default MSList
