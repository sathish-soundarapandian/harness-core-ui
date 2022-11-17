/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { defaultTo, set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { StageElementConfig } from 'services/cd-ng'
import { DynamicPopover } from '@common/components'
import { renderPopover } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilder'
import type { DynamicPopoverHandlerBinding } from '@common/components/DynamicPopover/DynamicPopover'
import {
  StageAttributes,
  usePipelineContext
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useGlobalEventListener } from '@common/hooks'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { getCommonStyles, PopoverData } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { DefaultNewTemplateId } from 'framework/Templates/templates'
import type { TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { DefaultNewStageId } from '@templates-library/components/TemplateStudio/StageTemplateCanvas/StageTemplateForm/StageTemplateForm'
import { SplitViewTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import CreateNodeStage from '@pipeline/components/PipelineDiagram/Nodes/CreateNode/CreateNodeStage'
import PipelineStageNode from '@pipeline/components/PipelineDiagram/Nodes/DefaultNode/PipelineStageNode/PipelineStageNode'
import { DiamondNodeWidget } from '@pipeline/components/PipelineDiagram/Nodes/DiamondNode/DiamondNode'
import css from './StageTemplateDiagram.module.scss'
import stageBuilderCss from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilder.module.scss'
const CREATE_NODE_ID = 'create-node'
const EMPTY_STRING = ''

export const StageTemplateDiagram = (): JSX.Element => {
  const {
    state: { template, gitDetails }
  } = React.useContext(TemplateContext)
  const {
    state: {
      pipeline,
      pipelineView,
      selectionState: { selectedStageId },
      templateTypes,
      gitDetails: pipelineGitDetails,
      storeMetadata
    },
    contextType,
    stagesMap,
    updatePipeline,
    updatePipelineView,
    setSelection,
    renderPipelineStage,
    getStageFromPipeline
  } = usePipelineContext()
  const selectedStage = getStageFromPipeline(defaultTo(selectedStageId, ''))
  const [dynamicPopoverHandler, setDynamicPopoverHandler] = React.useState<
    DynamicPopoverHandlerBinding<PopoverData> | undefined
  >()
  const [stageData, setStageData] = React.useState<StageAttributes>()
  const canvasRef = React.useRef<HTMLDivElement | null>(null)
  const { templateIdentifier } = useParams<TemplateStudioPathProps>()

  useGlobalEventListener('CLOSE_CREATE_STAGE_POPOVER', () => {
    dynamicPopoverHandler?.hide()
  })

  const openStageSelection = (nodeId: string): void => {
    dynamicPopoverHandler?.show(
      `[data-nodeid="${nodeId}"]`,
      {
        addStageNew: async (newStage: StageElementWrapper) => {
          dynamicPopoverHandler?.hide()
          set(pipeline, 'stages[0].stage', { ...newStage.stage, identifier: DefaultNewStageId })
          await updatePipeline(pipeline)
          setSelection({ stageId: DefaultNewStageId })
          updatePipelineView({
            ...pipelineView,
            isSplitViewOpen: true,
            splitViewData: { type: SplitViewTypes.StageView }
          })
        },
        isStageView: false,
        renderPipelineStage,
        stagesMap: stagesMap,
        contextType,
        templateTypes,
        gitDetails: pipelineGitDetails,
        storeMetadata
      },
      { useArrows: true, darkMode: false, fixedPosition: false, placement: 'bottom-start' }
    )
  }

  const getOptions = (stage: StageElementConfig): any => {
    return {
      identifier: stage.identifier,
      id: stage.identifier,
      name: EMPTY_STRING,
      data: {
        isInComplete: false,
        loopingStrategyEnabled: !!stage?.strategy,
        conditionalExecutionEnabled: stage.when
          ? stage.when?.pipelineStatus !== 'Success' || !!stage.when?.condition?.trim()
          : false
      },
      customNodeStyle: { ...getCommonStyles(false), borderColor: 'var(--primary-7)', borderStyle: 'solid' },
      defaultSelected: false,
      allowAdd: false,
      icon: stagesMap[defaultTo(stage.type, '')]?.icon,
      iconUrl: template.icon,
      showMarkers: false,
      isParallelNode: false,
      isSelected: false,
      readonly: true,
      onClick: onClickHandler
    }
  }

  React.useEffect(() => {
    if (!!template.name && !(template.spec as StageElementConfig)?.type) {
      openStageSelection(CREATE_NODE_ID)
    }
  }, [template.name, gitDetails])

  React.useEffect(() => {
    const stageType = selectedStage.stage?.stage?.type || ''
    if (stageType) {
      setStageData(stagesMap[stageType])
    }
  }, [selectedStage.stage?.stage?.type, selectedStageId, stagesMap])

  const onClickHandler = (_event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    dynamicPopoverHandler?.hide()
    if (templateIdentifier === DefaultNewTemplateId) {
      openStageSelection(CREATE_NODE_ID)
    }
  }

  return (
    <Container
      className={css.container}
      background={Color.FORM_BG}
      width={'100%'}
      padding={{ left: 'xxxlarge', right: 'xxxlarge' }}
      ref={canvasRef}
      onClick={e => {
        const div = e.target as HTMLDivElement
        if (div === canvasRef.current?.children[0]) {
          dynamicPopoverHandler?.hide()
        }
      }}
    >
      <Layout.Vertical height={'100%'} flex={{ justifyContent: 'center', alignItems: 'flex-start' }} spacing={'small'}>
        <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_600} margin={{ bottom: 'small' }}>
          Stage Type
        </Text>
        <Container>
          <Layout.Horizontal className={css.normalLayout}>
            <Container data-nodeid={CREATE_NODE_ID}>
              {selectedStage.stage?.stage?.type ? (
                stageData?.isApproval ? (
                  <DiamondNodeWidget {...getOptions(selectedStage.stage?.stage)} />
                ) : (
                  <PipelineStageNode {...getOptions(selectedStage.stage?.stage)} />
                )
              ) : (
                <CreateNodeStage identifier={CREATE_NODE_ID} name={EMPTY_STRING} onClick={onClickHandler} />
              )}
            </Container>
            <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_600}>
              {defaultTo(stageData?.name, '')}
            </Text>
          </Layout.Horizontal>
        </Container>
      </Layout.Vertical>
      <DynamicPopover
        darkMode={false}
        className={stageBuilderCss.renderPopover}
        render={renderPopover}
        bind={setDynamicPopoverHandler}
      />
    </Container>
  )
}
