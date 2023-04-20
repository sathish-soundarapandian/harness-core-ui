/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, PropsWithChildren } from 'react'
import { Text, FontVariation } from '@harness/uicore'
export interface FlagEvent {
  time: Date
  flagKind: string
  flagName: string
  result?: string
  detail: string
}
export interface EventTableProps {
  data: Array<FlagEvent>
  onClick: (content: string) => void
}
export interface EventTableCellProps {
  content: string
}
import css from '../FeatureFlagsEventViewer.module.scss'

const TableHeader: React.FC<PropsWithChildren<unknown>> = ({ children }) => (
  <th>
    <Text font={{ variation: FontVariation.SMALL_BOLD }} lineClamp={1}>
      {children}
    </Text>
  </th>
)

const TableCell: React.FC<PropsWithChildren<unknown>> = ({ children }) => (
  <td>
    <Text font={{ variation: FontVariation.SMALL }} lineClamp={1}>
      {children}
    </Text>
  </td>
)

export const EventsTable: React.FC<EventTableProps> = ({ data, onClick }) => {
  const [sorted, setSorted] = useState<Array<FlagEvent>>([])
  useEffect(() => {
    const newArray = [...data]
    newArray.sort((a, b) => b.time.getTime() - a.time.getTime())
    setSorted(newArray)
  }, [data]);

  const detailsClicked = (e: React.MouseEvent, row: FlagEvent) => {
    e.preventDefault()
    const details: FlagEvent = {...row}
    delete details.result
    onClick(JSON.stringify(details, null, 2))
  }

  return (
    <table className={css.eventsTable}>
      <thead>
        <tr>
          <TableHeader>Time</TableHeader>
          <TableHeader>Kind</TableHeader>
          <TableHeader>Name</TableHeader>
          <TableHeader>Result</TableHeader>
          <TableHeader>Evaluation Details</TableHeader>
        </tr>
      </thead>
      <tbody>
        { sorted.map((row) => (
          <tr key={`${row.time.getTime()}-${row.flagName}`}>
            <TableCell>{row.time.toLocaleTimeString()}</TableCell>
            <TableCell>{row.flagKind}</TableCell>
            <TableCell>{row.flagName}</TableCell>
            <TableCell>{row.result}</TableCell>
            <TableCell><a href="#" onClick={e => detailsClicked(e, row)}>Details</a></TableCell>
          </tr>
        ))}
      </tbody>
  </table>
  )
} 