/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createContext, useContext } from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { defaultTo } from 'lodash-es'
import type { DateRange } from '@blueprintjs/datetime'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { Scope } from 'services/cd-ng'
import { startOfDay, TimeRangeSelectorProps } from '@common/components/TimeRangeSelector/TimeRangeSelector'
import { useStrings } from 'framework/strings'
import { useLocalStorage } from '@common/hooks'

interface LandingDashboardContextProps {
  selectedTimeRange: TimeRangeSelectorProps
  selectTimeRange: (timeRange: TimeRangeSelectorProps) => void
  scope: Scope
}

export const validTimeFormat = (timeRange: TimeRangeSelectorProps): TimeRangeSelectorProps => {
  //convert to valid format if string
  if (typeof timeRange.range[0] === 'string') {
    timeRange.range[0] = new Date(defaultTo(timeRange.range[0], ''))
    timeRange.range[1] = new Date(defaultTo(timeRange.range[1], ''))
  }
  return timeRange
}

const defaultRange: DateRange = [startOfDay(moment().subtract(1, 'month').add(1, 'day')), startOfDay(moment())]

const LandingDashboardContext = createContext<LandingDashboardContextProps>({
  selectedTimeRange: {
    range: defaultRange,
    label: ''
  },
  selectTimeRange: () => void 0,
  scope: {}
})

export function LandingDashboardContextProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { getString } = useStrings()
  const [selectedTimeRange, setSelectedTimeRange] = useLocalStorage<TimeRangeSelectorProps>(
    'timeRangeHome',
    {
      range: defaultRange,
      label: getString('common.duration.month')
    },
    window.sessionStorage
  )

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const selectTimeRange = (range: TimeRangeSelectorProps): void => {
    setSelectedTimeRange(range)
  }

  const timeServiceDetail = validTimeFormat(selectedTimeRange)
  selectedTimeRange.range[0] = timeServiceDetail.range[0]
  selectedTimeRange.range[1] = timeServiceDetail.range[1]

  return (
    <LandingDashboardContext.Provider
      value={{
        selectedTimeRange,
        selectTimeRange,
        scope: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
      }}
    >
      {props.children}
    </LandingDashboardContext.Provider>
  )
}

export function useLandingDashboardContext(): LandingDashboardContextProps {
  return useContext(LandingDashboardContext)
}

export default LandingDashboardContext
