/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import cx from 'classnames'
import React, { useState } from 'react'
import { Container } from '@harness/uicore'
import type { Feature } from 'services/cf'
import { AuditLogsToolbar } from './AuditLogsToolbar'
import { AuditLogsList } from './AuditLogsList'

export interface AuditLogsProps {
  flagData: Feature
  objectType: 'FeatureActivation' | 'Segment'
  className?: string
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ className, flagData, objectType }) => {
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
    <Container className={cx(className)}>
      <AuditLogsToolbar
        startDate={startDate}
        endDate={endDate}
        onSelectedDateRangeChange={selectedDates => {
          setStartDate(selectedDates[0])
          setEndDate(selectedDates[1])
        }}
      />
      <AuditLogsList startDate={startDate} endDate={endDate} flagData={flagData} objectType={objectType} />
    </Container>
  )
}
