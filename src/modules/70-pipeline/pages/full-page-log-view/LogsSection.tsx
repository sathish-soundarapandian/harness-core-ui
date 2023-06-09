/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import type { LogLineData } from '@pipeline/components/LogsContent/LogsState/types'
import { MultiLogLine } from '@pipeline/components/LogsContent/components/MultiLogLine/MultiLogLine'

export interface LogsSectionProps {
  data: LogLineData[]
  className?: string
}

export default function LogsSection(props: LogsSectionProps): React.ReactElement {
  const { data, className } = props
  return (
    <div className={className}>
      {data.map((line, i) => (
        <MultiLogLine key={i} lineNumber={i} {...line} limit={data.length} />
      ))}
    </div>
  )
}
