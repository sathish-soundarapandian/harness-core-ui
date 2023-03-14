/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Container, Popover, useToaster } from '@harness/uicore'
import { chunk, defaultTo } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import cx from 'classnames'
import { IconName, Menu, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import {
  useHandleManualInterventionInterrupt,
  ExecutionNode,
  HandleManualInterventionInterruptQueryParams,
  ExecutionGraph
} from 'services/pipeline-ng'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { Strategy, strategyIconMap, stringsMap, StrategyType } from '@pipeline/utils/FailureStrategyUtils'
import { Duration } from '@common/exports'
import type { StepDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import { StageType } from '@pipeline/utils/stageHelpers'
import { allowedStrategiesAsPerStep } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/StrategySelection/StrategyConfig'
import { StepMode } from '@pipeline/utils/stepUtils'
import { isExecutionWaitingForIntervention } from '@pipeline/utils/statusHelpers'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import routes from '@common/RouteDefinitions'
import type { ChaosCustomMicroFrontendProps, ChaosStepExecutionProps } from '@chaos/interfaces/Chaos.types'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from './ChaosExperimentExecView.module.scss'

// eslint-disable-next-line import/no-unresolved
const ChaosStepExecution = React.lazy(() => import('chaos/ChaosStepExecution'))

export interface ActionButtonProps {
  step: ExecutionNode
  allowedStrategies: StrategyType[]
  isManualInterruption: boolean
  executionMetadata: ExecutionGraph['executionMetadata']
}

export function ActionButtons(props: ActionButtonProps): React.ReactElement {
  const { allowedStrategies, step, isManualInterruption, executionMetadata } = props
  const { orgIdentifier, projectIdentifier, accountId, planExecutionId } = defaultTo(executionMetadata, {})
  const {
    mutate: handleInterrupt,
    loading,
    error
  } = useHandleManualInterventionInterrupt({
    planExecutionId,
    nodeExecutionId: step.uuid || /* istanbul ignore next */ ''
  })
  const { showError } = useToaster()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()

  function handleChange(strategy: StrategyType): void {
    const interruptType = strategy as HandleManualInterventionInterruptQueryParams['interruptType']
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

  const STRATEGIES: StrategyType[][] = React.useMemo(() => chunk(allowedStrategies, 5), [allowedStrategies])

  React.useEffect(() => {
    if (error) {
      showError(getRBACErrorMessage(error), undefined, 'pipeline.error.intervention')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  return (
    <div className={cx({ [css.loading]: loading })}>
      {isManualInterruption ? (
        <Popover
          minimal={true}
          position={Position.BOTTOM_RIGHT}
          content={
            <Menu>
              {STRATEGIES.map((layer, i) => {
                return (
                  <div key={i} className={css.listStyle}>
                    {layer.map((strategy, j) => (
                      <Menu.Item
                        key={j}
                        data-testid={strategy}
                        icon={strategyIconMap[strategy] as IconName}
                        text={getString(stringsMap[strategy])}
                        textClassName={css.performActionStyle}
                        onClick={() => handleChange(strategy)}
                        className={css.menuItemStyle}
                      />
                    ))}
                  </div>
                )
              })}
            </Menu>
          }
        >
          <div>
            <Button
              text={getString('common.performAction')}
              variation={ButtonVariation.PRIMARY}
              rightIcon="chevron-down"
            />
          </div>
        </Popover>
      ) : (
        <></>
      )}
    </div>
  )
}

export default function ChaosExperimentExecView(props: StepDetailProps): React.ReactElement {
  const history = useHistory()
  const { step, stageType = StageType.DEPLOY, executionMetadata } = props
  const isManualInterruption = isExecutionWaitingForIntervention(step.status)
  const failureStrategies = allowedStrategiesAsPerStep(stageType)[StepMode.STEP].filter(
    st => st !== Strategy.ManualIntervention
  )

  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()

  return (
    <Container padding="medium">
      <ChildAppMounter<ChaosStepExecutionProps & ChaosCustomMicroFrontendProps>
        ChildApp={ChaosStepExecution}
        notifyID={step.executableResponses?.[0]?.async?.callbackIds?.[0] ?? ''}
        expectedResilienceScore={step.stepParameters?.spec?.expectedResilienceScore ?? 50}
        actionButtons={
          <ActionButtons
            step={step}
            allowedStrategies={failureStrategies}
            isManualInterruption={isManualInterruption}
            executionMetadata={executionMetadata}
          />
        }
        onViewExecutionClick={expRunIdentifier =>
          history.push(
            routes.toChaosExperimentRun({
              accountId: accountId,
              orgIdentifier: orgIdentifier,
              projectIdentifier: projectIdentifier,
              expIdentifier: step.stepParameters?.spec.experimentRef,
              expRunIdentifier: expRunIdentifier
            })
          )
        }
        customComponents={{
          Duration
        }}
        status={step.status as string}
        isManualInterruption={isManualInterruption}
      />
    </Container>
  )
}
