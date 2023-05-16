/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { ICollapseProps } from '@blueprintjs/core';
import { Collapse as BPCollpase, Button } from '@blueprintjs/core'
import cx from 'classnames'

import css from './Collpase.module.scss'

export interface CollapseProps {
  title: React.ReactNode
  children: React.ReactNode
  className?: string
  titleClassName?: string
  titleContentClassName?: string
  isDefaultOpen?: boolean
  bpCollapseProps?: Omit<ICollapseProps, 'isOpen'>
}

export function Collapse(props: CollapseProps): React.ReactElement {
  const { title, children, className, bpCollapseProps, isDefaultOpen, titleClassName, titleContentClassName } = props
  const [expanded, setExpanded] = React.useState(isDefaultOpen)

  function toggle(): void {
    setExpanded(status => !status)
  }

  return (
    <div className={cx(css.collapse, className)}>
      <div className={cx(css.title, titleClassName)}>
        <div className={titleContentClassName}>{title}</div>
        <Button
          icon="chevron-down"
          minimal
          small
          data-testid="toggle-collapse"
          className={cx(css.toggle, { [css.open]: expanded })}
          onClick={toggle}
        />
      </div>
      <BPCollpase {...bpCollapseProps} isOpen={expanded}>
        <div className={css.content}>{children}</div>
      </BPCollpase>
    </div>
  )
}
