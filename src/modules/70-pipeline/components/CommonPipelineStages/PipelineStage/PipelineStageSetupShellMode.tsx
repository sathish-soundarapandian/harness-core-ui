/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef, useState } from 'react'
import cx from 'classnames'
import { Button, ButtonVariation, Icon, Layout, Tab, Tabs } from '@harness/uicore'
import { Expander } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import type { StageElementConfig } from 'services/cd-ng'
import { SaveTemplateButton } from '@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton'
import { isContextTypeNotStageTemplate } from '@pipeline/components/PipelineStudio/PipelineUtils'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { PipelineStageOverview } from './PipelineStageOverview'
import { PipelineStageAdvancedSpecifications } from './PipelineStageAdvancedSpecifications'
import { PipelineStageInputSection } from './PipelineStageInputSection'
import { PipelineStageTabs, TabsHeadingOrder } from './utils'
import approvalStepCss from '../ApprovalStage/ApprovalStageSetupShellMode.module.scss'

export function PipelineStageSetupShellMode(): React.ReactElement {
  const { getString } = useStrings()
  const layoutRef = useRef<HTMLDivElement>(null)
  const [selectedTabId, setSelectedTabId] = useState<PipelineStageTabs>(PipelineStageTabs.OVERVIEW)
  const pipelineContext = usePipelineContext()
  const { checkErrorsForTab } = React.useContext(StageErrorContext)
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId = '' },
      storeMetadata
    },
    contextType,
    getStageFromPipeline,
    updatePipeline,
    setSelectedSectionId
  } = pipelineContext

  const { stage: selectedStage } = getStageFromPipeline<StageElementConfig>(selectedStageId)

  const handleTabChange = (nextTab: PipelineStageTabs): void => {
    checkErrorsForTab(selectedTabId).then(_ => {
      updatePipeline(pipeline)
      setSelectedTabId(nextTab)
      setSelectedSectionId(nextTab)
    })
  }

  const actionBtns: React.ReactElement = (
    <Layout.Horizontal>
      {selectedTabId !== PipelineStageTabs.OVERVIEW && (
        <Button
          text={getString('previous')}
          variation={ButtonVariation.SECONDARY}
          icon="chevron-left"
          onClick={() => handleTabChange(TabsHeadingOrder[Math.max(0, TabsHeadingOrder.indexOf(selectedTabId) - 1)])}
          margin={{ right: 'medium' }}
        />
      )}
      {selectedTabId !== PipelineStageTabs.ADVANCED && (
        <Button
          text={getString('next')}
          variation={ButtonVariation.PRIMARY}
          rightIcon="chevron-right"
          onClick={() =>
            handleTabChange(
              TabsHeadingOrder[Math.min(TabsHeadingOrder.length, TabsHeadingOrder.indexOf(selectedTabId) + 1)]
            )
          }
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
        onChange={(tabId: PipelineStageTabs) => setSelectedTabId(tabId)}
        selectedTabId={selectedTabId}
        data-tabId={selectedTabId}
      >
        <Tab
          id={PipelineStageTabs.OVERVIEW}
          panel={<PipelineStageOverview>{actionBtns}</PipelineStageOverview>}
          title={
            <span className={approvalStepCss.tab}>
              <Icon name="tick" height={20} size={20} color={Color.GREEN_800} />
              {getString('overview')}
            </span>
          }
          data-testid={PipelineStageTabs.OVERVIEW}
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
          id={PipelineStageTabs.INPUTS}
          title={
            <span className={approvalStepCss.tab}>
              <Icon name="deployment-success-legacy" height={20} size={20} />
              {getString('inputs')}
            </span>
          }
          panel={<PipelineStageInputSection storeMetadata={storeMetadata}>{actionBtns}</PipelineStageInputSection>}
          data-testid={PipelineStageTabs.INPUTS}
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
          id={PipelineStageTabs.ADVANCED}
          title={
            <span className={approvalStepCss.tab}>
              <Icon name="advanced" height={20} size={20} />
              {getString('advancedTitle')}
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
          data-testid={PipelineStageTabs.ADVANCED}
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
