/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useState, useCallback } from 'react'
import { DateRangePicker, DateRange, IDateRangeShortcut } from '@blueprintjs/datetime'
import { Position } from '@blueprintjs/core'
import moment from 'moment'

import { Color } from '@harness/design-system'
import { Container, Layout, Popover, Button, Text, PageSpinner } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import { useListActivities } from 'services/cd-ng'
import { ActivityLogFileStoreList } from './ActivityLogFileStoreList'
import { FileStoreContext } from '../FileStoreContext/FileStoreContext'

import css from './ActivityLogFileStore.module.scss'

const DATE_FORMAT = 'DD MMMM YYYY'
export const today = () => moment()
export const yesterday = () => moment().subtract(1, 'days')
const startOfDay = (time: moment.Moment) => time.startOf('day').toDate()
const endOfDay = (time: moment.Moment) => time.endOf('day').toDate()

export const FileStoreLogs = () => {
  const { queryParams, currentNode } = useContext(FileStoreContext)
  const { getString } = useStrings()

  const [dateRange, setDateRange] = useState<DateRange>([startOfDay(yesterday()), endOfDay(today())])
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState<boolean>(false)
  const closeDateRangePicker = useCallback(() => setIsDateRangePickerOpen(false), [])
  const { data: activityList, loading } = useListActivities({
    queryParams: {
      referredEntityType: 'Files',
      accountIdentifier: queryParams.accountIdentifier,
      projectIdentifier: queryParams.projectIdentifier,
      orgIdentifier: queryParams.orgIdentifier,
      identifier: currentNode.identifier,
      startTime: moment(dateRange[0]).startOf('day').valueOf(),
      endTime: moment(dateRange[1]).endOf('day').valueOf()
    }
  })

  const dateRangeShortcuts = [
    {
      dateRange: [startOfDay(today()), startOfDay(today())],
      label: getString('common.datePickerShortcuts.Today'),
      includeTime: true
    },
    {
      dateRange: [startOfDay(yesterday()), startOfDay(yesterday())],
      label: getString('common.datePickerShortcuts.Yesterday'),
      includeTime: true
    },
    {
      dateRange: [startOfDay(today().subtract(1, 'days')), endOfDay(today())],
      label: getString('common.datePickerShortcuts.Last2Days'),
      includeTime: true
    },
    {
      dateRange: [startOfDay(today().subtract(2, 'days')), endOfDay(today())],
      label: getString('common.datePickerShortcuts.Last3Days'),
      includeTime: true
    },
    {
      dateRange: [startOfDay(today().subtract(6, 'days')), endOfDay(today())],
      label: getString('common.datePickerShortcuts.LastWeek'),
      includeTime: true
    },
    {
      dateRange: [startOfDay(today().subtract(30, 'days')), endOfDay(today())],
      label: getString('common.datePickerShortcuts.LastMonth'),
      includeTime: true
    },
    {
      dateRange: [startOfDay(today().subtract(60, 'days')), endOfDay(today())],
      label: getString('common.datePickerShortcuts.Last2Months'),
      includeTime: true
    }
  ] as IDateRangeShortcut[]

  const getDateRangeText = (): JSX.Element => {
    return (
      <Text color={Color.GREY_900}>{`${moment(dateRange[0]?.valueOf()).format(DATE_FORMAT)}- ${moment(
        dateRange[1]?.valueOf()
      ).format(DATE_FORMAT)}`}</Text>
    )
  }
  return (
    <Layout.Vertical>
      <Container className={css.fsActivityFilter}>
        <Popover
          minimal
          position={Position.BOTTOM_RIGHT}
          isOpen={isDateRangePickerOpen}
          className={css.popoverClassname}
          popoverClassName={css.popoverClassname}
          onClose={closeDateRangePicker}
        >
          <Button
            large
            text={getDateRangeText()}
            icon="calendar"
            rightIcon="chevron-down"
            color={Color.BLUE_500}
            onClick={() => setIsDateRangePickerOpen(!isDateRangePickerOpen)}
          />
          <DateRangePicker
            className={css.dateRangePicker}
            maxDate={new Date()}
            defaultValue={dateRange}
            shortcuts={dateRangeShortcuts}
            onChange={range => {
              if (range[0] && range[1]) {
                setDateRange(range)
                closeDateRangePicker()
              }
            }}
            allowSingleDayRange={true}
          />
        </Popover>
      </Container>
      {loading ? (
        <PageSpinner />
      ) : (
        <Container data-test-id="fs-logs-list">
          <ActivityLogFileStoreList activityList={activityList?.data?.content} />
        </Container>
      )}
    </Layout.Vertical>
  )
}
