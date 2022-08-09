/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import cx from 'classnames'
import { HarnessDocTooltip } from '@wings-software/uicore'
import { StringKeys, useStrings } from 'framework/strings'
import css from './StringWithTooltip.module.scss'

export interface StringWithTooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  stringId: StringKeys
  tooltipId: string
  stringIdVars?: Record<string, any>
  className?: string
}

const StringWithTooltip = ({
  stringId,
  tooltipId,
  className = '',
  stringIdVars,
  ...otherProps
}: StringWithTooltipProps): ReactElement => {
  const { getString } = useStrings()

  return (
    <span className={cx(css.align, className)} {...otherProps} data-tooltip-id={tooltipId}>
      {getString(stringId, stringIdVars)}
      <HarnessDocTooltip tooltipId={tooltipId} useStandAlone />
    </span>
  )
}

export default StringWithTooltip
