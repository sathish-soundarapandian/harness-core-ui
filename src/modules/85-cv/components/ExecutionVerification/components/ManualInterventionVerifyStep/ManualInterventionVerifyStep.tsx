/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Text, SelectOption, useToaster, Select } from '@harness/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import {
  useHandleManualInterventionInterrupt,
  ExecutionNode,
  HandleManualInterventionInterruptQueryParams
} from 'services/pipeline-ng'
import { Strategy, strategyIconMap, StrategyType } from '@pipeline/utils/FailureStrategyUtils'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { isExecutionWaitingForIntervention } from '@pipeline/utils/statusHelpers'
import { allowedStrategiesAsPerStep } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/StrategySelection/StrategyConfig'
import { StageType } from '@pipeline/utils/stageHelpers'
import { StepMode } from '@pipeline/utils/stepUtils'
import { useStrings } from 'framework/strings'
import css from './ManualInterventionVerifyStep.module.scss'

export interface ManualInterventionVerifyStepProps {
  step: ExecutionNode
  allowedStrategies?: StrategyType[]
}

export function ManualInterventionVerifyStep(props: ManualInterventionVerifyStepProps): React.ReactElement {
  const { step, allowedStrategies } = props
  const { orgIdentifier, projectIdentifier, executionIdentifier, accountId } =
    useParams<PipelineType<ExecutionPathProps>>()

  const { getString } = useStrings()
  const { showError } = useToaster()

  const isManualInterruption = isExecutionWaitingForIntervention(step.status)
  const failureStrategies =
    allowedStrategies ||
    allowedStrategiesAsPerStep(StageType.DEPLOY)[StepMode.STEP].filter(st => st !== Strategy.ManualIntervention)

  const {
    mutate: handleInterrupt,
    loading,
    error
  } = useHandleManualInterventionInterrupt({
    planExecutionId: executionIdentifier,
    nodeExecutionId: step?.uuid || ''
  })

  const handleChange = (strategy: SelectOption): void => {
    const interruptType = strategy?.value as HandleManualInterventionInterruptQueryParams['interruptType']
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

  const permissibleActions: SelectOption[] = React.useMemo(() => {
    return (
      failureStrategies?.map(strategy => {
        return {
          value: strategy,
          label: strategy,
          icon: { name: strategyIconMap[strategy] }
        }
      }) || []
    )
  }, [failureStrategies])

  useEffect(() => {
    // since pipeline api is used here therefore using using pipeline way of handling error.
    if (error) {
      showError((error as any).data?.message || error.message, undefined, 'pipeline.error.intervention')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  if (isManualInterruption) {
    return (
      <Container
        className={css.shadow}
        padding={'small'}
        border={{ radius: 0 }}
        background={Color.YELLOW_100}
        flex={{ justifyContent: 'flex-start' }}
        width={'100%'}
      >
        <Text font={{ weight: 'bold', size: 'small' }} color={Color.BLACK} padding={{ right: 'small' }}>
          {getString('cv.deploymentVerification.failed')}
        </Text>
        <Container color={Color.BLACK} className={cx(css.manualInterventionTab, { [css.loading]: loading })}>
          <Select
            className={css.permissibleActions}
            name={'permissibleActions'}
            items={permissibleActions}
            onChange={handleChange}
            inputProps={{ placeholder: getString('common.performAction') }}
          />
        </Container>
      </Container>
    )
  }
  return <></>
}
