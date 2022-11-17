/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Icon, IconName } from '@harness/uicore'

import { StringKeys, useStrings } from 'framework/strings'

import { ExecutionLayoutState, useExecutionLayoutContext } from './ExecutionLayoutContext'

import css from './ExecutionLayoutToggle.module.scss'

export interface ExecutionLayoutToggleProps {
  className?: string
}

const iconNameMap: Record<ExecutionLayoutState, IconName> = {
  [ExecutionLayoutState.BOTTOM]: 'layout-bottom',
  [ExecutionLayoutState.FLOATING]: 'layout-float',
  [ExecutionLayoutState.RIGHT]: 'layout-right',
  [ExecutionLayoutState.MINIMIZE]: 'minus'
}

const labelMap: Record<ExecutionLayoutState, StringKeys> = {
  [ExecutionLayoutState.BOTTOM]: 'pipeline.execution.layouts.bottom',
  [ExecutionLayoutState.FLOATING]: 'pipeline.execution.layouts.float',
  [ExecutionLayoutState.RIGHT]: 'pipeline.execution.layouts.right',
  [ExecutionLayoutState.MINIMIZE]: 'pipeline.execution.layouts.minimize'
}

const layouts: ExecutionLayoutState[] = [
  ExecutionLayoutState.RIGHT,
  ExecutionLayoutState.BOTTOM,
  ExecutionLayoutState.FLOATING,
  ExecutionLayoutState.MINIMIZE
]

const SCROLL_OFFSET = 45

export default function ExecutionLayoutToggle(props: ExecutionLayoutToggleProps): React.ReactElement {
  const { layout, setLayout } = useExecutionLayoutContext()
  const { getString } = useStrings()
  const ref = React.useRef<HTMLDivElement | null>(null)
  const isMounted = React.useRef(false)

  function handleViewChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const newLayout = e.target.value
    setLayout(newLayout as ExecutionLayoutState)
  }

  // this effect should not run on mount
  React.useLayoutEffect(() => {
    let timer: number | null = null
    if (isMounted.current && layout === ExecutionLayoutState.BOTTOM) {
      timer = window.setTimeout(() => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect()
          const isOutOfView = rect.top > window.innerHeight
          const container = document.getElementById('pipeline-execution-container')

          if (isOutOfView && container) {
            container.scrollTo({ top: Math.abs(rect.bottom + SCROLL_OFFSET - window.innerHeight), behavior: 'smooth' })
          }
        }
      }, 200)
    }

    return () => {
      if (timer) {
        window.clearTimeout(timer)
      }
    }
  }, [layout])

  React.useLayoutEffect(() => {
    isMounted.current = true
  }, [])

  return (
    <div ref={ref} className={cx(css.toggle, props.className)}>
      {layouts.map(key => (
        <label key={key} className={css.label} title={getString(labelMap[key])}>
          <input type="radio" name="layout" value={key} onChange={handleViewChange} checked={layout === key} />
          <Icon name={iconNameMap[key]} />
        </label>
      ))}
    </div>
  )
}
