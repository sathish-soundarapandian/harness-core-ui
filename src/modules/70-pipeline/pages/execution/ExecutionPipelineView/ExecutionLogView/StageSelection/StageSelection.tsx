/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Accordion, AccordionHandle, Icon, Text } from '@harness/uicore'
import { Divider, Spinner } from '@blueprintjs/core'
import { defaultTo, get, isEmpty } from 'lodash-es'

import { useUpdateQueryParams } from '@common/hooks'
import { processExecutionData } from '@pipeline/utils/executionUtils'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { isExecutionNotStarted, isExecutionSkipped, isExecutionWaitingForInput } from '@pipeline/utils/statusHelpers'
import { StatusHeatMap } from '@pipeline/components/StatusHeatMap/StatusHeatMap'
import { String as TemplateString } from 'framework/strings'
import type { ExecutionNode, GraphLayoutNode } from 'services/pipeline-ng'
import { stageGroupTypes, StageType } from '@pipeline/utils/stageHelpers'
import { StepsTree } from '../StepsTree/StepsTree'
import { StatusIcon } from '../StepsTree/StatusIcon'
import statusIconCss from '../StepsTree/StatusIcon.module.scss'
import css from './StageSelection.module.scss'

const SCROLL_OFFSET = 250

export interface StageSelectionProps {
  openExecutionTimeInputsForStep(node?: ExecutionNode): void
}

export function StageSelection(props: StageSelectionProps): React.ReactElement {
  const {
    childPipelineStagesMap,
    rollbackPipelineStagesMap,
    allStagesMap,
    allNodeMap,
    pipelineExecutionDetail,
    selectedStageId,
    selectedChildStageId,
    selectedStepId,
    selectedStageExecutionId,
    isDataLoadedForSelectedStage,
    queryParams,
    loading
  } = useExecutionContext()
  const { openExecutionTimeInputsForStep } = props
  const accordionRef = React.useRef<AccordionHandle | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const prevSelectedStageIdRef = React.useRef(selectedStageId)
  const prevSelectedStageExecutionId = React.useRef(selectedStageExecutionId)
  const prevSelectedChildStageIdRef = React.useRef(selectedChildStageId)
  const hasUserClicked = React.useRef(false)
  const [childPipelineEntries, setChildPipelineEntries] = React.useState<Array<[string, GraphLayoutNode]>>([])

  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<ExecutionPageQueryParams>()

  const handleExecInputClick = React.useCallback(
    (node?: ExecutionNode) => {
      return (e: React.SyntheticEvent) => {
        e.stopPropagation()
        openExecutionTimeInputsForStep(node)
      }
    },
    [openExecutionTimeInputsForStep]
  )
  React.useEffect(() => {
    let timer: number

    if (accordionRef.current && selectedStageId) {
      const newIdentifier =
        !isEmpty(selectedStageExecutionId) && isEmpty(selectedChildStageId)
          ? [selectedStageId, selectedStageExecutionId].join('|')
          : selectedStageId
      accordionRef.current.open(newIdentifier)
      const scrollPanelIntoView = (): void => {
        const panel = document.querySelector(`[data-testid="${newIdentifier}-panel"]`)
        if (panel && containerRef.current) {
          const rect = panel.getBoundingClientRect()
          containerRef.current.scrollTop += rect.top - SCROLL_OFFSET
        } else {
          timer = window.setTimeout(() => {
            scrollPanelIntoView()
          }, 300)
        }
      }

      scrollPanelIntoView()
    }

    return () => {
      if (timer) {
        window.clearTimeout(timer)
      }
    }
  }, [selectedStageId, selectedStageExecutionId, selectedChildStageId])

  React.useEffect(() => {
    if (!loading) {
      // only update reference, after API is complete
      prevSelectedStageIdRef.current = selectedStageId
      prevSelectedStageExecutionId.current = selectedStageExecutionId
      prevSelectedChildStageIdRef.current = selectedChildStageId
    }
  }, [selectedStageId, selectedStageExecutionId, selectedChildStageId, loading])

  React.useEffect(() => {
    // if (prevSelectedStageIdRef.current === selectedStageId)
    if (!isEmpty(childPipelineStagesMap)) setChildPipelineEntries([...childPipelineStagesMap.entries()])
    if (!isEmpty(rollbackPipelineStagesMap)) setChildPipelineEntries([...rollbackPipelineStagesMap.entries()])
  }, [childPipelineStagesMap, rollbackPipelineStagesMap])

  const tree = React.useMemo(
    () => processExecutionData(pipelineExecutionDetail?.executionGraph),
    [pipelineExecutionDetail?.executionGraph]
  )

  const childPipelineTree = React.useMemo(
    () =>
      processExecutionData(
        pipelineExecutionDetail?.childGraph?.executionGraph || pipelineExecutionDetail?.rollbackGraph?.executionGraph
      ),
    [pipelineExecutionDetail?.childGraph?.executionGraph, pipelineExecutionDetail?.rollbackGraph?.executionGraph]
  )

  function handleStepSelect(stepId: string, retryStep?: string): void {
    updateQueryParams({
      step: stepId,
      stage: selectedStageId,
      childStage: selectedChildStageId,
      stageExecId: selectedStageExecutionId,
      retryStep
    })
  }

  /**
   * This function is called even during auto stage selection,
   * we should call this only when user clicks it.
   */
  function handleAccordionChange(stageId: string | string[]): void {
    if (hasUserClicked.current) {
      const [stageNodeId, stageNodeExecId] = Array.isArray(stageId) ? stageId : (stageId || '').split('|')

      if (typeof stageId === 'string' && stageId && stageNodeId) {
        const params = {
          ...queryParams,
          stage: stageNodeId,
          stageExecId: stageNodeExecId
        }
        delete params?.step
        delete params?.childStage
        replaceQueryParams(params)
      }
      if (stageId && stageId !== prevSelectedStageIdRef.current) setChildPipelineEntries([])
      hasUserClicked.current = false
    }
  }

  function handleChildAccordionChange(childStageId: string | string[]): void {
    const [childStageNodeId, stageNodeExecId] = Array.isArray(childStageId)
      ? childStageId
      : (childStageId || '').split('|')
    if (
      hasUserClicked.current &&
      !isEmpty(childPipelineEntries) &&
      childStageId &&
      typeof childStageId === 'string' &&
      childStageNodeId
    ) {
      const params = {
        ...queryParams,
        stage: selectedStageId,
        stageExecId: stageNodeExecId,
        childStage: childStageNodeId
      }
      delete params?.step
      replaceQueryParams(params)
      hasUserClicked.current = false
    }
  }

  const stageEntries = [...allStagesMap.entries()]
  const stages = [...allStagesMap.values()]

  return (
    <div ref={containerRef} className={css.mainContainer} onClick={() => (hasUserClicked.current = true)}>
      <div className={css.statusHeader}>
        <div className={css.heatmap}>
          <StatusHeatMap
            data={stages}
            getId={i => defaultTo(i.nodeIdentifier, '')}
            getStatus={i => i.status as ExecutionStatus}
          />
        </div>
        <TemplateString
          stringID={stageEntries.length > 1 ? 'pipeline.numOfStages' : 'pipeline.numOfStage'}
          vars={{ n: stageEntries.length }}
        />
      </div>
      <Accordion
        ref={accordionRef}
        className={css.mainAccordion}
        onChange={handleAccordionChange}
        panelClassName={css.accordionPanel}
        summaryClassName={css.accordionSummary}
        detailsClassName={cx(css.accordionDetails, {
          [css.pipelineRollback]:
            !isEmpty(selectedStageId) &&
            selectedStageId ===
              get(
                pipelineExecutionDetail?.rollbackGraph?.pipelineExecutionSummary,
                ['parentStageInfo', 'stagenodeid'],
                ''
              )
        })}
      >
        {stageEntries.map(([identifier, stage]) => {
          const newIdentifier = stage?.strategyMetadata
            ? [stage.nodeUuid, stage.nodeExecutionId].join('|')
            : defaultTo(stage.nodeUuid, identifier)
          const isChainedPipelineOrRollbackStage = stageGroupTypes.includes(stage.nodeType as StageType)
          const shouldShowExecutionInputs =
            !!stage?.executionInputConfigured && isExecutionWaitingForInput(stage.status) && !!selectedStageId
          const shouldShowTree =
            ((!isChainedPipelineOrRollbackStage &&
              !isEmpty(selectedStageExecutionId) &&
              newIdentifier.includes(selectedStageExecutionId)) ||
              newIdentifier.includes(selectedStageId)) &&
            isDataLoadedForSelectedStage &&
            (!loading ||
              prevSelectedStageIdRef.current === stage.nodeUuid ||
              prevSelectedStageExecutionId.current === stage.nodeExecutionId)

          return (
            <Accordion.Panel
              key={newIdentifier}
              id={newIdentifier}
              disabled={isExecutionSkipped(stage.status) || isExecutionNotStarted(stage.status)}
              summary={
                <div className={css.stageName}>
                  <div className={css.stageUtil}>
                    {stage.nodeType !== StageType.PIPELINE_ROLLBACK ? (
                      <StatusIcon className={css.icon} status={stage.status as ExecutionStatus} />
                    ) : (
                      <Icon
                        className={cx(
                          statusIconCss.statusIcon,
                          statusIconCss.pipelinerollback,
                          css.pipelineRollbackIcon
                        )}
                        name={'circle-pipeline-rollback'}
                        size={23}
                      />
                    )}
                    <Text lineClamp={1}>{stage.name}</Text>
                  </div>
                  {shouldShowExecutionInputs ? (
                    <button
                      className={css.inputWaiting}
                      onClick={handleExecInputClick(allNodeMap[defaultTo(stage.nodeExecutionId, '')])}
                    >
                      <Icon name="runtime-input" size={12} />
                    </button>
                  ) : null}
                </div>
              }
              details={
                isChainedPipelineOrRollbackStage ? (
                  shouldShowTree && !isEmpty(childPipelineEntries) ? (
                    <Accordion
                      className={css.mainAccordion}
                      activeId={
                        isEmpty(selectedStageExecutionId)
                          ? selectedChildStageId
                          : [selectedChildStageId, selectedStageExecutionId].join('|')
                      }
                      onChange={handleChildAccordionChange}
                      panelClassName={css.accordionChildPanel}
                      summaryClassName={css.accordionChildSummary}
                      detailsClassName={css.accordionDetails}
                    >
                      {childPipelineEntries.map(([childIdentifier, childStage]) => {
                        const newChildIdentifier = childStage?.strategyMetadata
                          ? [childStage.nodeUuid, childStage.nodeExecutionId].join('|')
                          : childIdentifier.split('|')[0]
                        const shouldShowChildPipelineStepsTree =
                          newChildIdentifier.includes(selectedStageExecutionId || selectedChildStageId || '') &&
                          (!loading || prevSelectedChildStageIdRef.current === childStage.nodeUuid)

                        return (
                          <Accordion.Panel
                            key={newChildIdentifier}
                            id={newChildIdentifier}
                            disabled={isExecutionSkipped(childStage.status) || isExecutionNotStarted(childStage.status)}
                            summary={
                              <div className={css.stageName}>
                                <div>
                                  <StatusIcon className={css.icon} status={childStage.status as ExecutionStatus} />
                                  <Text lineClamp={1}>{childStage.name}</Text>
                                </div>
                              </div>
                            }
                            details={
                              shouldShowChildPipelineStepsTree ? (
                                <>
                                  <Divider />
                                  <StepsTree
                                    allNodeMap={allNodeMap}
                                    nodes={childPipelineTree}
                                    selectedStepId={selectedStepId}
                                    onStepSelect={handleStepSelect}
                                    retryStep={queryParams.retryStep}
                                    isRoot
                                    openExecutionTimeInputsForStep={openExecutionTimeInputsForStep}
                                  />
                                </>
                              ) : (
                                <Spinner size={20} className={css.spinner} />
                              )
                            }
                          />
                        )
                      })}
                    </Accordion>
                  ) : (
                    <Spinner size={20} className={css.spinner} />
                  )
                ) : shouldShowTree ? (
                  <>
                    <Divider />
                    <StepsTree
                      allNodeMap={allNodeMap}
                      nodes={tree}
                      selectedStepId={selectedStepId}
                      onStepSelect={handleStepSelect}
                      retryStep={queryParams.retryStep}
                      isRoot
                      openExecutionTimeInputsForStep={openExecutionTimeInputsForStep}
                    />
                  </>
                ) : (
                  <Spinner size={20} className={css.spinner} />
                )
              }
            />
          )
        })}
      </Accordion>
    </div>
  )
}
