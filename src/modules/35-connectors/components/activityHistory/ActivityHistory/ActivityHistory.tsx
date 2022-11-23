/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import moment from 'moment'

import { Position } from '@blueprintjs/core'
import { DateRangePicker, DateRange, IDateRangeShortcut } from '@blueprintjs/datetime'
import { Container, Layout, Popover, Button, Text, PageSpinner } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import {
  GetActivitiesSummaryQueryParams,
  useListActivities,
  ResponsePageActivity,
  useGetConnectivitySummary,
  ResponseConnectivityCheckSummary
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { UseGetMockData } from '@common/utils/testUtils'

import ActivityList from '../ActivityList/ActivityList'
import ActivityGraph from '../ActivityGraph/ActivityGraph'

import css from './ActivityHistory.module.scss'

interface ActivityHistoryprops {
  referredEntityType: GetActivitiesSummaryQueryParams['referredEntityType']
  entityIdentifier: string
  mockActivitykData?: UseGetMockData<ResponsePageActivity>
  mockConnectivitySummary?: UseGetMockData<ResponseConnectivityCheckSummary>
}
export interface ActivityGraphDataType {
  Success: Array<Array<number | undefined>>
  Failure: Array<Array<number | undefined>>
  HeartBeatFailure: Array<Array<number | undefined>>
}

const DATE_FORMAT = 'DD MMMM YYYY '
export const today = () => moment()
export const yesterday = () => moment().subtract(1, 'days')
const startOfDay = (time: moment.Moment) => time.startOf('day').toDate()
const endOfDay = (time: moment.Moment) => time.endOf('day').toDate()

const ActivityHistory: React.FC<ActivityHistoryprops> = props => {
  const [showConnectivityChecks, setShowConnectivityChecks] = useState<boolean>(true)
  const [showOtherActivity, setShowOtherActivity] = useState<boolean>(true)
  const [dateRange, setDateRange] = useState<DateRange>([startOfDay(today()), endOfDay(today())])
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState<boolean>(false)
  const [dataFormat, setDataFormat] = useState<GetActivitiesSummaryQueryParams['timeGroupType']>('HOUR')
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const closeDateRangePicker = useCallback(() => setIsDateRangePickerOpen(false), [])
  const {
    data: activityList,
    loading,
    refetch: refetchActivities
  } = useListActivities({
    queryParams: {
      referredEntityType: props.referredEntityType,
      accountIdentifier: accountId,
      projectIdentifier: projectIdentifier,
      orgIdentifier: orgIdentifier,
      identifier: props.entityIdentifier,
      startTime: moment(dateRange[1]).startOf('day').valueOf(),
      endTime: moment(dateRange[1]).endOf('day').valueOf()
    },
    mock: props.mockActivitykData
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

  const {
    data: connectivitySummary,
    loading: loadingConnectivitySummary,
    refetch: refetchConnectivitySummary
  } = useGetConnectivitySummary({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier: projectIdentifier,
      orgIdentifier: orgIdentifier,
      identifier: props.entityIdentifier,
      startTime: moment(dateRange[1]).startOf('day').valueOf(),
      endTime: moment(dateRange[1]).endOf('day').valueOf()
    },
    mock: props.mockConnectivitySummary
  })

  const getDateRangeText = (): JSX.Element => {
    return (
      <Text color={Color.GREY_900}>{`${moment(dateRange[0]?.valueOf()).format(DATE_FORMAT)}- ${moment(
        dateRange[1]?.valueOf()
      ).format(DATE_FORMAT)}`}</Text>
    )
  }

  return (
    <Layout.Vertical background={Color.GREY_100} className={css.page} padding="xlarge" border={true}>
      <Container background={Color.WHITE}>
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
            margin="small"
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
                setShowConnectivityChecks(true)
                setShowOtherActivity(true)
                if (range[0].valueOf() === range[1].valueOf()) {
                  setDataFormat('HOUR')
                } else {
                  setDataFormat('DAY')
                }

                setDateRange(range)
                closeDateRangePicker()
              }
            }}
            allowSingleDayRange={true}
          />
        </Popover>
        <ActivityGraph
          referredEntityType={props.referredEntityType}
          entityIdentifier={props.entityIdentifier}
          dataFormat={dataFormat}
          dateRange={dateRange}
          refetchActivities={refetchActivities}
          refetchConnectivitySummary={refetchConnectivitySummary}
          setShowConnectivityChecks={setShowConnectivityChecks}
          setShowOtherActivity={setShowOtherActivity}
        />
      </Container>

      {!loading && !loadingConnectivitySummary ? (
        <ActivityList
          activityList={activityList || {}}
          connectivitySummary={connectivitySummary || {}}
          entityIdentifier={props.entityIdentifier}
          dateRange={dateRange}
          refetchActivities={refetchActivities}
          refetchConnectivitySummary={refetchConnectivitySummary}
          showConnectivityChecks={showConnectivityChecks}
          showOtherActivity={showOtherActivity}
        />
      ) : (
        <PageSpinner />
      )}
    </Layout.Vertical>
  )
}

export default ActivityHistory
