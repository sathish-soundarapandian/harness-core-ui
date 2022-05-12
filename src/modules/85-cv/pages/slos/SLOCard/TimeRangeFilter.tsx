/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import type { DateRange } from '@blueprintjs/datetime'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Color,
  Container,
  DateRangePickerButton,
  FontVariation,
  Layout,
  Text
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { SLOCardToggleViews, SLOTargetChartWithChangeTimelineProps } from '../CVSLOsListingPage.types'
import css from '../CVSLOsListingPage.module.scss'

const TimeRangeFilter: React.FC<SLOTargetChartWithChangeTimelineProps> = ({
  type,
  serviceLevelObjective,
  timeRangeFilters,
  chartTimeRange,
  setChartTimeRange,
  resetSlider,
  customTimeFilter,
  setCustomTimeFilter
}) => {
  const { getString } = useStrings()
  const { sloPerformanceTrend, errorBudgetBurndown, currentPeriodStartTime, currentPeriodEndTime } =
    serviceLevelObjective

  const SLOEndTime = sloPerformanceTrend[sloPerformanceTrend.length - 1]?.timestamp
  const errorBudgetEndTime = errorBudgetBurndown[errorBudgetBurndown.length - 1]?.timestamp
  const _endTime = (type === SLOCardToggleViews.SLO ? SLOEndTime : errorBudgetEndTime) ?? currentPeriodStartTime

  const { startTime = currentPeriodStartTime, endTime = _endTime } = chartTimeRange ?? {}

  const getDefaultValue = (): DateRange | undefined => {
    if (customTimeFilter) {
      return [new Date(startTime), new Date(endTime)]
    }
  }

  return (
    <Layout.Horizontal>
      <Text font={{ variation: FontVariation.TINY }} color={Color.GREY_600} className={css.currentTimeRange}>
        {moment(new Date(startTime)).format('lll')} - {moment(new Date(endTime)).format('lll')}
      </Text>
      {chartTimeRange && (
        <Container border={{ right: true }} margin={{ right: 'medium' }}>
          <Button
            text={getString('reset')}
            size={ButtonSize.SMALL}
            border={{ right: true }}
            padding={{ left: 'small' }}
            variation={ButtonVariation.LINK}
            onClick={() => {
              resetSlider()
              setCustomTimeFilter(false)
              setChartTimeRange?.()
            }}
          />
        </Container>
      )}
      {timeRangeFilters?.map(({ displayName, durationMilliSeconds = 0 }, index) => (
        <Button
          key={index}
          text={displayName}
          size={ButtonSize.SMALL}
          variation={
            !customTimeFilter && endTime - startTime === durationMilliSeconds
              ? ButtonVariation.SECONDARY
              : ButtonVariation.LINK
          }
          onClick={() => {
            resetSlider()
            setCustomTimeFilter(false)
            setChartTimeRange?.({ startTime: _endTime - durationMilliSeconds, endTime: _endTime })
          }}
        />
      ))}
      <DateRangePickerButton
        initialButtonText={getString('common.repo_provider.customLabel')}
        renderButtonText={/* istanbul ignore next */ () => getString('common.repo_provider.customLabel')}
        onChange={
          /* istanbul ignore next */
          selectedDate => {
            resetSlider()
            setCustomTimeFilter(true)
            setChartTimeRange?.({ startTime: selectedDate[0].getTime(), endTime: selectedDate[1].getTime() })
          }
        }
        dateRangePickerProps={{
          shortcuts: false,
          defaultValue: getDefaultValue(),
          minDate: new Date(currentPeriodStartTime),
          maxDate: new Date(currentPeriodEndTime)
        }}
        rightIcon={undefined}
        size={ButtonSize.SMALL}
        variation={customTimeFilter ? ButtonVariation.SECONDARY : ButtonVariation.LINK}
      />
    </Layout.Horizontal>
  )
}

export default TimeRangeFilter
