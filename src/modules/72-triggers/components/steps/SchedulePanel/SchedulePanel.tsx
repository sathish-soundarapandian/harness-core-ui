/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Tabs, Tab, Text, HarnessDocTooltip } from '@harness/uicore'
import cx from 'classnames'

import { useStrings } from 'framework/strings'

import { getDefaultExpressionBreakdownValues, scheduleTabsId } from './components/utils'

import MinutesTab from './components/MinutesTab/MinutesTab'
import HourlyTab from './components/HourlyTab/HourlyTab'
import DailyTab from './components/DailyTab/DailyTab'
import WeeklyTab from './components/WeeklyTab/WeeklyTab'
import MonthlyTab from './components/MonthlyTab/MonthlyTab'
import YearlyTab from './components/YearlyTab/YearlyTab'
import CustomTab from './components/CustomTab/CustomTab'

import css from './SchedulePanel.module.scss'

interface SchedulePanelPropsInterface {
  formikProps?: any
  isEdit?: boolean
}

const SchedulePanel: React.FC<SchedulePanelPropsInterface> = ({
  formikProps: {
    values: { selectedScheduleTab },
    values
  },
  formikProps,
  isEdit = false
}): JSX.Element => {
  const { getString } = useStrings()
  const currentDate = new Date()

  return (
    <Layout.Vertical className={cx(css.schedulePanelContainer)} spacing="large" padding="xxlarge">
      <Text className={css.formContentTitle} inline={true}>
        {getString('common.schedule')}
        <HarnessDocTooltip tooltipId="schedulePanel" useStandAlone={true} />
        <Layout.Horizontal flex>
          <Text>
            {getString('triggers.schedulePanel.currentUTCTime')} {currentDate.getUTCHours()}:
            {String(currentDate.getUTCMinutes()).padStart(2, '0')}
          </Text>
          <Text>
            {getString('triggers.schedulePanel.currentTime')}
            {currentDate.getHours()}:{String(currentDate.getMinutes()).padStart(2, '0')}
          </Text>
        </Layout.Horizontal>
      </Text>
      <Layout.Vertical className={css.formContent}>
        <Tabs
          id="Wizard"
          onChange={(val: string) => {
            const newDefaultValues = selectedScheduleTab !== val ? getDefaultExpressionBreakdownValues(val) : {}
            formikProps.setValues({ ...values, ...newDefaultValues, selectedScheduleTab: val })
          }}
          defaultSelectedTabId={selectedScheduleTab}
        >
          {!isEdit && (
            <Tab
              id={scheduleTabsId.MINUTES}
              title={getString('triggers.schedulePanel.minutesLabel')}
              panel={<MinutesTab formikProps={formikProps} />}
            />
          )}
          {!isEdit && (
            <Tab
              id={scheduleTabsId.HOURLY}
              title={getString('triggers.schedulePanel.hourlyTabTitle')}
              panel={<HourlyTab formikProps={formikProps} />}
            />
          )}
          {!isEdit && (
            <Tab
              id={scheduleTabsId.DAILY}
              title={getString('triggers.schedulePanel.dailyTabTitle')}
              panel={<DailyTab formikProps={formikProps} />}
            />
          )}
          {!isEdit && (
            <Tab
              id={scheduleTabsId.WEEKLY}
              title={getString('triggers.schedulePanel.weeklyTabTitle')}
              panel={<WeeklyTab formikProps={formikProps} />}
            />
          )}
          {!isEdit && (
            <Tab
              id={scheduleTabsId.MONTHLY}
              title={getString('triggers.schedulePanel.monthlyTabTitle')}
              panel={<MonthlyTab formikProps={formikProps} />}
            />
          )}
          {!isEdit && (
            <Tab
              id={scheduleTabsId.YEARLY}
              title={getString('triggers.schedulePanel.yearlyTabTitle')}
              panel={<YearlyTab formikProps={formikProps} />}
            />
          )}
          <Tab
            id={scheduleTabsId.CUSTOM}
            title={getString('common.repo_provider.customLabel')}
            panel={<CustomTab formikProps={formikProps} />}
          />
        </Tabs>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
export default SchedulePanel
