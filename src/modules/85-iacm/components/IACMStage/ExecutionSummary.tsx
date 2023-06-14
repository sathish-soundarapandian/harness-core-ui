/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Icon } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ExecutionSummaryProps } from '@pipeline/factories/ExecutionFactory/types'
import { getUIByType } from '@ci/components/CIExecutionSummary/CIExecutionSummary'
import { UIType, getUIType } from '@ci/components/common/getUIType'
import css from '@ci/components/CIExecutionSummary/CIExecutionSummary.module.scss'

export const IACMExecutionSummary = ({ data }: ExecutionSummaryProps): React.ReactElement => {
  const { getString } = useStrings()

  if (!data) {
    return <></>
  }

  const uiType = getUIType(data)
  if (!uiType) {
    return <></>
  }

  const ui = getUIByType(uiType, { data, getString })
  if (!ui) {
    return <></>
  }

  return (
    <div className={cx(css.main, { [css.pullRequest]: uiType === UIType.PullRequest })}>
      <Icon className={css.icon} size={18} name="iacm" />
      {ui}
    </div>
  )
}
