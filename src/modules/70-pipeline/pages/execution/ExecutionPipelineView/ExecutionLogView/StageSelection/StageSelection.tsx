/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Accordion, AccordionHandle } from '@harness/uicore'
import { Spinner } from '@blueprintjs/core'
import { defaultTo } from 'lodash-es'

import { useUpdateQueryParams } from '@common/hooks'
import { processExecutionData } from '@pipeline/utils/executionUtils'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { isExecutionNotStarted, isExecutionSkipped } from '@pipeline/utils/statusHelpers'
import { StatusHeatMap } from '@pipeline/components/StatusHeatMap/StatusHeatMap'
import { String as TemplateString } from 'framework/strings'
import { StepsTree } from '../StepsTree/StepsTree'
import { StatusIcon } from '../StepsTree/StatusIcon'

import css from './StageSelection.module.scss'

const SCROLL_OFFSET = 250

export function StageSelection(): React.ReactElement {
  const {
    pipelineStagesMap,
    allNodeMap,
    pipelineExecutionDetail,
    selectedStageId,
    selectedStepId,
    queryParams,
    loading
  } = useExecutionContext()

  const accordionRef = React.useRef<AccordionHandle | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const { updateQueryParams } = useUpdateQueryParams<ExecutionPageQueryParams>()

  React.useEffect(() => {
    let timer: number

    if (accordionRef.current && selectedStageId) {
      accordionRef.current.open(selectedStageId)
      const scrollPanelIntoView = (): void => {
        const panel = document.querySelector(`[data-testid="${selectedStageId}-panel"]`)
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
  }, [selectedStageId])

  const tree = React.useMemo(
    () => processExecutionData(pipelineExecutionDetail?.executionGraph),
    [pipelineExecutionDetail?.executionGraph]
  )

  function handleStepSelect(stepId: string, retryStep?: string): void {
    updateQueryParams({ step: stepId, stage: selectedStageId, retryStep })
  }

  function handleAccordionChange(stageId: string | string[]): void {
    if (typeof stageId === 'string' && stageId && selectedStageId !== stageId) {
      updateQueryParams({ stage: stageId })
    }
  }

  const stageEntries = [...pipelineStagesMap.entries()]
  const stages = [...pipelineStagesMap.values()]

  return (
    <div ref={containerRef} className={css.mainContainer}>
      <div className={css.statusHeader}>
        <div className={css.heatmap}>
          <StatusHeatMap
            data={stages}
            getId={i => defaultTo(i.nodeIdentifier, '')}
            getStatus={i => defaultTo(i.status, '')}
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
        detailsClassName={css.accordionDetails}
      >
        {stageEntries.map(([identifier, stage]) => (
          <Accordion.Panel
            key={identifier}
            id={identifier}
            disabled={isExecutionSkipped(stage.status) || isExecutionNotStarted(stage.status)}
            summary={
              <div>
                <StatusIcon className={css.icon} status={stage.status as ExecutionStatus} />
                <span>{stage.name}</span>
              </div>
            }
            details={
              identifier === selectedStageId && !loading ? (
                <StepsTree
                  allNodeMap={allNodeMap}
                  nodes={tree}
                  selectedStepId={selectedStepId}
                  onStepSelect={handleStepSelect}
                  retryStep={queryParams.retryStep}
                  isRoot
                />
              ) : (
                <Spinner size={20} className={css.spinner} />
              )
            }
          />
        ))}
      </Accordion>
    </div>
  )
}
