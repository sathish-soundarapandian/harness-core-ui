/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { chunk } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Thumbnail, useToaster } from '@wings-software/uicore'
import cx from 'classnames'

import { String, useStrings } from 'framework/strings'
import {
  useHandleManualInterventionInterrupt,
  ExecutionNode,
  HandleManualInterventionInterruptQueryParams
} from 'services/pipeline-ng'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { Strategy, strategyIconMap, stringsMap } from '@pipeline/utils/FailureStrategyUtils'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'

import css from './ManualInterventionTab.module.scss'

export interface ManualInterventionTabProps {
  step: ExecutionNode
  allowedStrategies: Strategy[]
}

export function ManualInterventionTab(props: ManualInterventionTabProps): React.ReactElement {
  const { allowedStrategies, step } = props
  const { orgIdentifier, projectIdentifier, executionIdentifier, accountId } =
    useParams<PipelineType<ExecutionPathProps>>()
  const {
    mutate: handleInterrupt,
    loading,
    error
  } = useHandleManualInterventionInterrupt({
    planExecutionId: executionIdentifier,
    nodeExecutionId: step.uuid || /* istanbul ignore next */ ''
  })
  const { showError } = useToaster()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const interruptType = e.target.value as HandleManualInterventionInterruptQueryParams['interruptType']
    handleInterrupt(undefined, {
      queryParams: {
        interruptType,
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      headers: { 'content-type': 'application/json' }
    })
  }

  const STRATEGIES: Strategy[][] = React.useMemo(() => chunk(allowedStrategies, 5), [allowedStrategies])

  React.useEffect(() => {
    if (error) {
      showError(getRBACErrorMessage(error), undefined, 'pipeline.error.intervention')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  return (
    <div className={cx(css.manualInterventionTab, { [css.loading]: loading })}>
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
  )
}
