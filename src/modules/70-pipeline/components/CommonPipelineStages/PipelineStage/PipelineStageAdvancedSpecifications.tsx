/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  Card,
  Container,
  getMultiTypeFromValue,
  HarnessDocTooltip,
  Layout,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE
} from '@harness/uicore'
import React from 'react'
import cx from 'classnames'
import { produce } from 'immer'
import { isEmpty, set, unset } from 'lodash-es'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { FailureStrategyWithRef } from '@pipeline/components/PipelineStudio/FailureStrategy/FailureStrategy'
import type { StepFormikRef } from '@pipeline/components/PipelineStudio/StepCommands/StepCommands'
import ConditionalExecution from '@pipeline/components/PipelineStudio/ConditionalExecution/ConditionalExecution'
import { StepActions } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useStrings } from 'framework/strings'
import type { ApprovalStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { DelegateSelectorWithRef } from '@pipeline/components/PipelineStudio/DelegateSelector/DelegateSelector'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import ErrorsStripBinded from '@pipeline/components/ErrorsStrip/ErrorsStripBinded'
import { isMultiTypeRuntime, isValueRuntimeInput } from '@common/utils/utils'
import MultiTypeSelectorButton from '@common/components/MultiTypeSelectorButton/MultiTypeSelectorButton'
import { PipelineStageTabs } from './utils'

import css from './PipelineStageAdvancedSpecifications.module.scss'

interface AdvancedSpecificationsProps {
  context?: string
  conditionalExecutionTooltipId: string
  failureStrategyTooltipId: string
  delegateSelectorTooltipId?: string
}
export function PipelineStageAdvancedSpecifications({
  children,
  conditionalExecutionTooltipId,
  failureStrategyTooltipId,
  delegateSelectorTooltipId = 'delegateSelector'
}: React.PropsWithChildren<AdvancedSpecificationsProps>): React.ReactElement {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()

  const {
    state: {
      selectionState: { selectedStageId }
    },
    isReadonly,
    getStageFromPipeline,
    updateStage
  } = usePipelineContext()
  const { stage } = getStageFromPipeline<ApprovalStageElementConfig>(selectedStageId || '')

  const formikRef = React.useRef<StepFormikRef | null>(null)
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const { submitFormsForTab } = React.useContext(StageErrorContext)
  const { errorMap } = useValidationErrors()

  React.useEffect(() => {
    if (errorMap.size > 0) {
      submitFormsForTab(PipelineStageTabs.ADVANCED)
    }
  }, [errorMap])

  return (
    <div className={cx(css.stageSection, css.editStageGrid)}>
      <ErrorsStripBinded domRef={scrollRef as React.MutableRefObject<HTMLElement | undefined>} />
      <div className={css.contentSection} ref={scrollRef}>
        <div className={css.tabHeading}>
          <span data-tooltip-id={delegateSelectorTooltipId}>
            {getString('pipeline.delegate.DelegateSelectorOptional')}
          </span>
        </div>
        <Card className={css.sectionCard} id="delegateSelector">
          <Layout.Horizontal>
            <div>
              <DelegateSelectorWithRef
                selectedStage={stage}
                isReadonly={isReadonly}
                ref={formikRef}
                onUpdate={delegateSelectors => {
                  const valuePassed = delegateSelectors.delegateSelectors
                  const { stage: pipelineStage } = getStageFromPipeline(selectedStageId || '')

                  if (pipelineStage && pipelineStage.stage) {
                    const stageData = produce(pipelineStage, draft => {
                      set(draft, 'stage.delegateSelectors', valuePassed)
                      if (isEmpty(valuePassed) || valuePassed[0] === '') {
                        unset(draft.stage, 'delegateSelectors')
                      }
                    })
                    if (stageData.stage) {
                      updateStage(stageData.stage)
                    }
                  }
                }}
                tabName={PipelineStageTabs.ADVANCED}
              />
            </div>
          </Layout.Horizontal>
        </Card>
        <div className={css.tabHeading}>
          <span data-tooltip-id={conditionalExecutionTooltipId}>
            {getString('pipeline.conditionalExecution.title')}
          </span>
          <MultiTypeSelectorButton
            className={css.multiTypeBtn}
            type={getMultiTypeFromValue(stage?.stage?.when as any)}
            allowedTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
            onChange={type => {
              const { stage: pipelineStage } = getStageFromPipeline(selectedStageId || '')
              if (pipelineStage && pipelineStage.stage) {
                const stageData = produce(pipelineStage, draft => {
                  if (isMultiTypeRuntime(type)) {
                    set(draft, 'stage.when', RUNTIME_INPUT_VALUE)
                  } else {
                    unset(draft, 'stage.when')
                  }
                })

                if (stageData.stage) {
                  updateStage(stageData.stage)
                }
              }
            }}
          />
          <HarnessDocTooltip tooltipId={conditionalExecutionTooltipId} useStandAlone={true} />
        </div>
        {!!stage && (
          <Card className={css.sectionCard} id="conditionalExecution">
            <Layout.Horizontal>
              <div className={css.stageSection}>
                <div className={cx(css.stageCreate, css.stageDetails)}>
                  <ConditionalExecution
                    isReadonly={isReadonly}
                    selectedStage={stage}
                    onUpdate={when => {
                      const { stage: pipelineStage } = getStageFromPipeline(selectedStageId || '')
                      if (pipelineStage && pipelineStage.stage) {
                        const stageData = produce(pipelineStage, draft => {
                          set(draft, 'stage.when', when)
                        })
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        updateStage(stageData.stage!)
                      }
                    }}
                  />
                </div>
              </div>
            </Layout.Horizontal>
          </Card>
        )}
        <div className={css.tabHeading}>
          <span data-tooltip-id={failureStrategyTooltipId}>{getString('pipeline.failureStrategies.title')}</span>
          <MultiTypeSelectorButton
            className={css.multiTypeBtn}
            type={getMultiTypeFromValue(stage?.stage?.failureStrategies as any)}
            allowedTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
            onChange={type => {
              const { stage: pipelineStage } = getStageFromPipeline(selectedStageId || '')
              if (pipelineStage && pipelineStage.stage) {
                const stageData = produce(pipelineStage, draft => {
                  if (isMultiTypeRuntime(type)) {
                    set(draft, 'stage.failureStrategies', RUNTIME_INPUT_VALUE)
                  } else {
                    unset(draft, 'stage.failureStrategies')
                  }
                })

                if (stageData.stage) {
                  updateStage(stageData.stage)
                }
              }
            }}
          />
          <HarnessDocTooltip tooltipId={failureStrategyTooltipId} useStandAlone={true} />
        </div>
        <Card className={css.sectionCard} id="failureStrategy">
          <div className={css.stageSection}>
            <div className={cx(css.stageCreate, css.stageDetails)}>
              <FailureStrategyWithRef
                selectedStage={stage}
                isReadonly={isReadonly}
                ref={formikRef}
                onUpdate={({ failureStrategies }) => {
                  const { stage: pipelineStage } = getStageFromPipeline(selectedStageId || '')
                  if (pipelineStage && pipelineStage.stage) {
                    const stageData = produce(pipelineStage, draft => {
                      if (
                        (Array.isArray(failureStrategies) && failureStrategies.length > 0) ||
                        isValueRuntimeInput(failureStrategies as any)
                      ) {
                        set(draft, 'stage.failureStrategies', failureStrategies)
                      } else {
                        unset(draft, 'stage.failureStrategies')
                      }
                    })
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    updateStage(stageData.stage!)
                    const errors = formikRef.current?.getErrors()
                    if (isEmpty(errors) && Array.isArray(failureStrategies)) {
                      const telemetryData = failureStrategies.map(strategy => ({
                        onError: strategy.onFailure?.errors?.join(', '),
                        action: strategy.onFailure?.action?.type
                      }))
                      telemetryData.length &&
                        trackEvent(StepActions.AddEditFailureStrategy, { data: JSON.stringify(telemetryData) })
                    }
                  }
                }}
              />
            </div>
          </div>
        </Card>
        <Container margin={{ top: 'xxlarge' }} className={css.navigationButtons}>
          {children}
        </Container>
      </div>
    </div>
  )
}
