/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import classNames from 'classnames'
import { Button, Icon } from '@harness/uicore'
import css from './RightBar.module.scss'

export interface RightBarProps {
  className?: string
}

const RightBar: React.FC<RightBarProps> = props => {
  const { className } = props

  return (
    <div className={classNames(css.main, className)}>
      <Button minimal>
        <Icon name="main-search" />
      </Button>
      <Button minimal>
        <Icon name="properties" />
      </Button>
    </div>
  )
}

export default RightBar
