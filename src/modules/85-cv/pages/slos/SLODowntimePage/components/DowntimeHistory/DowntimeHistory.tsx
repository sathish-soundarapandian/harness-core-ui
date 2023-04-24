/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext } from 'react'
import { Container, Layout, Page, TableV2, Text } from '@harness/uicore'
import type { CellProps, Renderer } from 'react-table'
import { useStrings } from 'framework/strings'
import type { DowntimeHistoryView, ResponsePageDowntimeHistoryView, UseGetHistoryProps } from 'services/cv'
import { DowntimeWindowToggleViews } from '@cv/pages/slos/components/CVCreateDowntime/components/CreateDowntimeForm/CreateDowntimeForm.types'
import {
  getDowntimeCategoryLabel,
  getFormattedTime
} from '@cv/pages/slos/components/CVCreateDowntime/CVCreateDowntime.utils'
import emptyData from '@cv/assets/emptyData.svg'
import DowntimeFilters from '../DowntimeFilters/DowntimeFilters'
import { FiltersContext } from '../../FiltersContext'
import { getDuration } from '../DowntimeList/DowntimeList.utils'
import { RenderServices } from '../DowntimeList/DowntimeList'
import { defaultDateTime } from '../../SLODowntimePage.constants'
import css from '../DowntimeList/DowntimeList.module.scss'

interface DowntimeHistoryProps {
  downtimeHistoryLoading: boolean
  downtimeHistoryData: ResponsePageDowntimeHistoryView | null
  refetchHistoryData: (data: UseGetHistoryProps) => void
  downtimeHistoryError?: string
}

const DowntimeHistory = ({
  downtimeHistoryData,
  downtimeHistoryLoading,
  refetchHistoryData,
  downtimeHistoryError
}: DowntimeHistoryProps): JSX.Element => {
  const { getString } = useStrings()
  const { queryParams, setPageNumber, pathParams, appliedSearchAndFilter } = useContext(FiltersContext)

  const { content, totalItems = 0, totalPages = 0, pageIndex = 0, pageSize = 10 } = downtimeHistoryData?.data ?? {}

  const RenderDowntimeName: Renderer<CellProps<DowntimeHistoryView>> = ({ row }) => {
    const downtimeHistory = row?.original
    const { name = '' } = downtimeHistory

    return (
      <Text title={name} className={css.firstLine}>
        {name}
      </Text>
    )
  }

  const RenderDowntimeType: Renderer<CellProps<DowntimeHistoryView>> = ({ row }) => {
    const downtimeHistory = row?.original
    const { type = DowntimeWindowToggleViews.ONE_TIME } = downtimeHistory?.downtimeDetails || {}

    return (
      <Text title={type} className={css.firstLine}>
        {type === DowntimeWindowToggleViews.ONE_TIME
          ? getString('common.occurrence.oneTime')
          : getString('common.occurrence.recurring')}
      </Text>
    )
  }

  const RenderTime = ({
    _time,
    downtimeHistory
  }: {
    _time?: string
    downtimeHistory: DowntimeHistoryView
  }): JSX.Element => {
    const { timezone = 'Asia/Calcutta' } = downtimeHistory?.downtimeDetails?.spec || {}

    const date = getFormattedTime({ dateTime: _time, format: 'LL' })
    const timeLabel = `${getFormattedTime({ dateTime: _time, format: 'LT' })} (${timezone})`

    return (
      <Layout.Vertical spacing={'xsmall'}>
        <Text title={date} className={css.firstLine}>
          {date}
        </Text>
        <Text title={timeLabel} className={css.secondLine}>
          {timeLabel}
        </Text>
      </Layout.Vertical>
    )
  }

  const RenderStartTime: Renderer<CellProps<DowntimeHistoryView>> = ({ row }) => {
    const downtimeHistory = row?.original
    const { startDateTime = defaultDateTime } = downtimeHistory

    return <RenderTime _time={startDateTime} downtimeHistory={downtimeHistory} />
  }

  const RenderEndTime: Renderer<CellProps<DowntimeHistoryView>> = ({ row }) => {
    const downtimeHistory = row?.original
    const { endDateTime = defaultDateTime } = downtimeHistory

    return <RenderTime _time={endDateTime} downtimeHistory={downtimeHistory} />
  }

  const RenderDowntimeDuration: Renderer<CellProps<DowntimeHistoryView>> = ({ row }) => {
    const downtimeHistory = row?.original
    const { duration } = downtimeHistory

    return <Text className={css.firstLine}>{getDuration(getString, duration)}</Text>
  }

  const RenderAffectedServices: Renderer<CellProps<DowntimeHistoryView>> = ({ row }) => {
    const downtimeHistory = row?.original
    const { affectedEntities = [] } = downtimeHistory
    const { serviceName, envName } = affectedEntities[0] || {}

    return <RenderServices affectedEntities={affectedEntities} serviceName={serviceName} envName={envName} />
  }

  const RenderDowntimeCategory: Renderer<CellProps<DowntimeHistoryView>> = ({ row }) => {
    const downtimeHistory = row?.original
    const { category = 'Other' } = downtimeHistory

    return (
      <Text title={category} className={css.firstLine}>
        {getDowntimeCategoryLabel(category, getString)}
      </Text>
    )
  }

  const columns = [
    {
      Header: getString('cv.sloDowntime.downtimeName').toUpperCase(),
      width: '23%',
      Cell: RenderDowntimeName
    },
    {
      Header: getString('typeLabel').toUpperCase(),
      width: '10%',
      Cell: RenderDowntimeType
    },
    {
      Header: getString('pipeline.startTime').toUpperCase(),
      width: '15%',
      Cell: RenderStartTime
    },
    {
      Header: getString('common.endTime').toUpperCase(),
      width: '15%',
      Cell: RenderEndTime
    },
    {
      Header: getString('pipeline.duration').toUpperCase(),
      width: '10%',
      Cell: RenderDowntimeDuration
    },
    {
      Header: getString('cv.affectedServices').toUpperCase(),
      width: '13%',
      Cell: RenderAffectedServices
    },
    {
      Header: getString('cv.sloDowntime.category').toUpperCase(),
      width: '14%',
      Cell: RenderDowntimeCategory
    }
  ]

  return (
    <Container margin={'xlarge'} padding={{ left: 'small', right: 'small' }}>
      <DowntimeFilters />
      <Page.Body
        loading={appliedSearchAndFilter && downtimeHistoryLoading}
        retryOnError={() => refetchHistoryData({ ...pathParams, queryParams })}
        error={downtimeHistoryError}
        noData={{
          when: () => !content?.length && !downtimeHistoryLoading,
          message: appliedSearchAndFilter
            ? getString('common.filters.noMatchingFilterData')
            : getString('cv.changeSource.noDataAvaiableForCard'),
          image: emptyData
        }}
        className={css.downtimeList}
      >
        {content?.length && (
          <Container margin={{ top: 'large' }}>
            <TableV2
              sortable={false}
              columns={columns}
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
          </Container>
        )}
      </Page.Body>
    </Container>
  )
}

export default DowntimeHistory
