/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { String, useStrings } from 'framework/strings'
import { ExecutionNode } from 'services/pipeline-ng'
import { Thumbnail, useToaster } from '@wings-software/uicore'
import { Strategy, strategyIconMap, stringsMap } from '@pipeline/utils/FailureStrategyUtils'
import headerCss from '@pipeline/pages/execution/ExecutionPipelineView/ExecutionGraphView/ExecutionStageDetailsHeader/ExecutionStageDetailsHeader.module.scss'
import css from './WaitStepDetailsTab.module.scss'

export interface WaitStepDetailsTabProps {
  step: ExecutionNode
}

export function WaitStepDetailsTab(props: WaitStepDetailsTabProps): React.ReactElement {
  const { step } = props
  const { getString } = useStrings()
  const STRATEGIES: Strategy[][] = [[Strategy.MarkAsSuccess], [Strategy.Abort]]

  const handleChange = () => {
    console.log('hello')
  }
  return (
    <React.Fragment>
      <div className={css.detailsTab}>`Duration : ${step}`</div>
      <div>
        <String tagName="div" className={css.title} stringID="common.PermissibleActions" />
        {STRATEGIES.map((layer, i) => {
          return (
            <div key={i} className={css.actionRow}>
              {layer.map((strategy, j) => (
                <Thumbnail
                  key={j}
                  label={getString(stringsMap[strategy])}
                  icon={strategyIconMap[strategy]}
                  value={strategy}
                  name={strategy}
                  onClick={handleChange}
                  className={css.thumbnail}
                />
              ))}
            </div>
          )
        })}
      </div>
    </React.Fragment>
  )
}
