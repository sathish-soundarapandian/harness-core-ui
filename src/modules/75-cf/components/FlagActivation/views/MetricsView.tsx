/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, Tab, Tabs, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { Feature } from 'services/cf'
import { MetricsToolbar } from './MetricsToolbar'
import { TabEvaluations } from './TabEvaluations'
import { TabServedTargets } from './TabServedTargets'
import css from './MetricsView.module.scss'

export const MetricsView: React.FC<{ flagData: Feature }> = ({ flagData }) => {
  const { getString } = useStrings()

  const [startDate, setStartDate] = useState<Date>(() => {
    const start = new Date()
    start.setDate(start.getDate() - 7)
    start.setHours(0, 0, 0, 0)
    return start
  })

  const [endDate, setEndDate] = useState<Date>(() => {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return end
  })

  return (
    <Container
      style={{
        marginTop: '-20px',
        height: 'calc(100vh - 135px)',
        overflow: 'auto'
      }}
    >
      <MetricsToolbar
        startDate={startDate}
        endDate={endDate}
        onSelectedDateRangeChange={selectedDates => {
          setStartDate(selectedDates[0])
          setEndDate(selectedDates[1])
        }}
      />
      <Container style={{ padding: 'var(--spacing-xsmall) 0 0 var(--spacing-xxxlarge)' }} className={css.content}>
        <Tabs id="flag-metrics" defaultSelectedTabId="evaluations">
          <Tab
            id="evaluations"
            title={
              <Text className={'css.tabTitle'}>
                {getString('cf.featureFlags.metrics.flagEvaluations', { count: 10 })}
              </Text>
            }
            panel={<TabEvaluations flagData={flagData} startDate={startDate} endDate={endDate} />}
          />
          <Tab
            id={'served-targets'}
            title={
              <Text className={'css.tabTitle'}>{getString('cf.featureFlags.metrics.targetServed', { count: 10 })}</Text>
            }
            panel={<TabServedTargets flagData={flagData} startDate={startDate} endDate={endDate} />}
          />
        </Tabs>
      </Container>
    </Container>
  )
}
