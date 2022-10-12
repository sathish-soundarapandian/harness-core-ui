/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import cx from 'classnames'
import { Button, ButtonVariation, Icon, Layout, Tab, Tabs } from '@wings-software/uicore'
import { Expander } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import type { StageElementConfig } from 'services/cd-ng'
import { SaveTemplateButton } from '@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton'
import { isContextTypeNotStageTemplate } from '@pipeline/components/PipelineStudio/PipelineUtils'
import { PipelineStageOverview } from './PipelineStageOverview'
import { PipelineStageAdvancedSpecifications } from './PipelineStageAdvancedSpecifications'
import approvalStepCss from '../ApprovalStage/ApprovalStageSetupShellMode.module.scss'

export function PipelineStageSetupShellMode(): React.ReactElement {
  const { getString } = useStrings()
  const tabHeadings = [getString('overview'), getString('inputs'), getString('advancedTitle')]
  const layoutRef = useRef<HTMLDivElement>(null)
  const [selectedTabId, setSelectedTabId] = React.useState<string>(tabHeadings[0])
  const pipelineContext = usePipelineContext()
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId = '' }
    },
    contextType,
    getStageFromPipeline,
    updatePipeline
  } = pipelineContext

  const { stage: selectedStage } = getStageFromPipeline<StageElementConfig>(selectedStageId)

  const actionBtns: React.ReactElement = (
    <Layout.Horizontal>
      {selectedTabId !== tabHeadings[0] && (
        <Button
          text={getString('back')}
          variation={ButtonVariation.SECONDARY}
          icon="chevron-left"
          onClick={() => {
            updatePipeline(pipeline)
            setSelectedTabId(tabHeadings[Math.max(0, tabHeadings.indexOf(selectedTabId) - 1)])
          }}
        />
      )}
      {selectedTabId !== tabHeadings[2] && (
        <Button
          text={selectedTabId === tabHeadings[1] ? getString('save') : getString('next')}
          variation={ButtonVariation.PRIMARY}
          rightIcon="chevron-right"
          onClick={() => {
            updatePipeline(pipeline)
            setSelectedTabId(tabHeadings[Math.min(tabHeadings.length, tabHeadings.indexOf(selectedTabId) + 1)])
          }}
        />
      )}
    </Layout.Horizontal>
  )

  React.useLayoutEffect(() => {
    // To drag and drop the canvas
    if (layoutRef.current) {
      /* istanbul ignore next */
      layoutRef.current.scrollTo?.(0, 0)
    }
  }, [selectedTabId])

  return (
    <section ref={layoutRef} key={selectedStageId} className={approvalStepCss.approvalStageSetupShellWrapper}>
      <Tabs
        id="pipelineStageSetupShell"
        onChange={(tabId: string) => setSelectedTabId(tabId)}
        selectedTabId={selectedTabId}
        data-tabId={selectedTabId}
      >
        <Tab
          id={tabHeadings[0]}
          panel={<PipelineStageOverview>{actionBtns}</PipelineStageOverview>}
          title={
            <span className={approvalStepCss.tab}>
              <Icon name="tick" height={20} size={20} color={Color.GREEN_800} />
              {tabHeadings[0]}
            </span>
          }
          data-testid={tabHeadings[0]}
        />
        <Icon
          name="chevron-right"
          height={20}
          size={20}
          margin={{ right: 'small', left: 'small' }}
          color={'grey400'}
          style={{ alignSelf: 'center' }}
        />
        <Tab
          id={tabHeadings[1]}
          title={
            <span className={approvalStepCss.tab}>
              <Icon name="deployment-success-legacy" height={20} size={20} />
              {tabHeadings[1]}
            </span>
          }
          panel={<div />}
          data-testid={tabHeadings[1]}
          className={cx(approvalStepCss.fullHeight, approvalStepCss.stepGroup)}
        />
        <Icon
          name="chevron-right"
          height={20}
          size={20}
          margin={{ right: 'small', left: 'small' }}
          color={'grey400'}
          style={{ alignSelf: 'center' }}
        />
        <Tab
          id={tabHeadings[2]}
          title={
            <span className={approvalStepCss.tab}>
              <Icon name="advanced" height={20} size={20} />
              {tabHeadings[2]}
            </span>
          }
          panel={
            <PipelineStageAdvancedSpecifications
              conditionalExecutionTooltipId="conditionalExecutionCustomStage"
              failureStrategyTooltipId="failureStrategyCustomStage"
            >
              {actionBtns}
            </PipelineStageAdvancedSpecifications>
          }
          data-testid={tabHeadings[2]}
        />
        {isContextTypeNotStageTemplate(contextType) && selectedStage?.stage && (
          <>
            <Expander />
            <SaveTemplateButton data={selectedStage.stage} type={'Stage'} />
          </>
        )}
      </Tabs>
    </section>
  )
}
