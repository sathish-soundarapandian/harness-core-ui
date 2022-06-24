import React from 'react'
import cx from 'classnames'

import css from './StatusHeatMap.module.scss'

export interface StatusHeatMapProps<T> {
  data: T[]
  getId: (item: T) => string
  getStatus: (item: T) => string
  className?: string
}

export function StatusHeatMap<T>(props: StatusHeatMapProps<T>): React.ReactElement {
  const { data, getId, getStatus, className } = props
  return (
    <div className={cx(css.statusHeatMap, className)}>
      {data.map(row => (
        <div
          key={getId(row)}
          data-id={getId(row)}
          data-status={getStatus(row).toLowerCase()}
          className={css.statusHeatMapCell}
        >
          &nbsp;
        </div>
      ))}
    </div>
  )
}
