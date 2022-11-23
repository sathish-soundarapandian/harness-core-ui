/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Layout, Button } from '@harness/uicore'

import css from './PipelineExecutionWarning.module.scss'

interface PipelineExecutionWarningProps {
  warning: string | React.ReactNode
}

export function PipelineExecutionWarning({ warning }: PipelineExecutionWarningProps): React.ReactElement {
  const [hideWarning, setHideWarning] = useState<boolean>(false)
  return !hideWarning ? (
    <Layout.Horizontal
      className={css.warningBanner}
      flex={{ justifyContent: 'flex-start' }}
      spacing="medium"
      padding={{ left: 'xlarge' }}
    >
      {warning}
      <Button icon="cross" minimal onClick={() => setHideWarning(true)} />
    </Layout.Horizontal>
  ) : (
    <></>
  )
}
