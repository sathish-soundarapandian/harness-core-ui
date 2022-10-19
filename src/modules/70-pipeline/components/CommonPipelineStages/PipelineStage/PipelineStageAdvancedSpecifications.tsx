/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Card, Container, HarnessDocTooltip, Layout } from '@wings-software/uicore'
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
import { LoopingStrategy } from '@pipeline/components/PipelineStudio/LoopingStrategy/LoopingStrategy'
import css from './PipelineStageAdvancedSpecifications.module.scss'

interface AdvancedSpecificationsProps {
  context?: string
  conditionalExecutionTooltipId?: string
  failureStrategyTooltipId?: string
  loopingStrategyTooltipId?: string
}
export function PipelineStageAdvancedSpecifications({
  children,
  conditionalExecutionTooltipId = 'conditionalExecutionApprovalStage',
  failureStrategyTooltipId = 'failureStrategyApprovalStage',
  loopingStrategyTooltipId = 'loopingStrategyApprovalStage'
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

  return (
    <div className={cx(css.stageSection, css.editStageGrid)}>
      <div className={css.contentSection} ref={scrollRef}>
        <div className={css.tabHeading}>
          <span data-tooltip-id={conditionalExecutionTooltipId}>
            {getString('pipeline.conditionalExecution.title')}
            <HarnessDocTooltip tooltipId={conditionalExecutionTooltipId} useStandAlone={true} />
          </span>
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
          <span data-tooltip-id={loopingStrategyTooltipId}>
            {getString('pipeline.loopingStrategy.title')}
            <HarnessDocTooltip tooltipId={loopingStrategyTooltipId} useStandAlone={true} />
          </span>
        </div>
        <Card className={css.sectionCard} id="loopingStrategy">
          <LoopingStrategy
            strategy={stage?.stage?.strategy}
            isReadonly={isReadonly}
            onUpdateStrategy={strategy => {
              const { stage: pipelineStage } = getStageFromPipeline(selectedStageId || '')
              if (pipelineStage && pipelineStage.stage) {
                const stageData = produce(pipelineStage, draft => {
                  if (isEmpty(strategy)) {
                    unset(draft, 'stage.strategy')
                  } else {
                    set(draft, 'stage.strategy', strategy)
                  }
                })
                if (stageData.stage) updateStage(stageData.stage)
              }
            }}
          />
        </Card>

        <div className={css.tabHeading}>
          <span data-tooltip-id={failureStrategyTooltipId}>
            {getString('pipeline.failureStrategies.title')}
            <HarnessDocTooltip tooltipId={failureStrategyTooltipId} useStandAlone={true} />
          </span>
        </div>
        <Card className={css.sectionCard} id="failureStrategy">
          <Layout.Horizontal>
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
                        set(draft, 'stage.failureStrategies', failureStrategies)
                      })
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      updateStage(stageData.stage!)
                      const errors = formikRef.current?.getErrors()
                      if (isEmpty(errors)) {
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
          </Layout.Horizontal>
        </Card>
        <Container margin={{ top: 'xxlarge' }} className={css.navigationButtons}>
          {children}
        </Container>
      </div>
    </div>
  )
}
