/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty, debounce, defaultTo } from 'lodash-es'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { NodeRunInfo, useGetBarrierInfo, useGetResourceConstraintsExecutionInfo } from 'services/pipeline-ng'
import type { CDStageModuleInfo } from 'services/cd-ng'
import { PageSpinner } from '@common/components'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { useExecutionLayoutContext } from '@pipeline/components/ExecutionLayout/ExecutionLayoutContext'
import type { DynamicPopoverHandlerBinding } from '@common/components/DynamicPopover/DynamicPopover'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { isExecutionPaused, isExecutionRunning } from '@pipeline/utils/statusHelpers'
import { DynamicPopover } from '@common/exports'
import HoverCard from '@pipeline/components/HoverCard/HoverCard'
import type { ExecutionPathProps } from '@common/interfaces/RouteInterfaces'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import type { ExecutionLayoutState } from '@pipeline/components/ExecutionLayout/ExecutionLayoutContext'
import ConditionalExecutionTooltipWrapper from '@pipeline/components/ConditionalExecutionToolTip/ConditionalExecutionTooltipWrapper'
import { getExecutionStageDiagramListeners, processExecutionDataV1 } from '@pipeline/utils/execUtils'

import {
  DiagramFactory,
  DiagramNodes,
  NodeType,
  BaseReactComponentProps
} from '@pipeline/components/PipelineDiagram/DiagramFactory'
import { DiamondNodeWidget } from '@pipeline/components/PipelineDiagram/Nodes/DiamondNode/DiamondNode'
import PipelineStepNode from '@pipeline/components/PipelineDiagram/Nodes/DefaultNode/PipelineStepNode/PipelineStepNode'
import { IconNode } from '@pipeline/components/PipelineDiagram/Nodes/IconNode/IconNode'
import CreateNodeStep from '@pipeline/components/PipelineDiagram/Nodes/CreateNode/CreateNodeStep'
import EndNodeStep from '@pipeline/components/PipelineDiagram/Nodes/EndNode/EndNodeStep'
import StartNodeStep from '@pipeline/components/PipelineDiagram/Nodes/StartNode/StartNodeStep'
import DiagramLoader from '@pipeline/components/DiagramLoader/DiagramLoader'
import { MatrixStepNode } from '@pipeline/components/PipelineDiagram/Nodes/MatrixStepNode/MatrixStepNode'
import { NodeDimensionProvider } from '@pipeline/components/PipelineDiagram/Nodes/NodeDimensionStore'
import BarrierStepTooltip from './components/BarrierStepTooltip/BarrierStepTooltip'
import ResourceConstraintTooltip from './components/ResourceConstraints/ResourceConstraints'
import VerifyStepTooltip from './components/VerifyStepTooltip/VerifyStepTooltip'
import type { FailureInfo } from './components/VerifyStepTooltip/VerifyStepTooltip.types'
import css from './ExecutionStageDetails.module.scss'

const diagram = new DiagramFactory('graph')

diagram.registerNode('Deployment', PipelineStepNode as unknown as React.FC<BaseReactComponentProps>, true)
diagram.registerNode(NodeType.CreateNode, CreateNodeStep as unknown as React.FC<BaseReactComponentProps>)
diagram.registerNode(NodeType.EndNode, EndNodeStep)
diagram.registerNode(NodeType.StartNode, StartNodeStep)
diagram.registerNode('STEP_GROUP', DiagramNodes[NodeType.StepGroupNode])
diagram.registerNode([NodeType.MatrixNode, NodeType.LoopNode, NodeType.PARALLELISM], MatrixStepNode)
diagram.registerNode('Approval', DiamondNodeWidget)
diagram.registerNode('JiraApproval', DiamondNodeWidget)
diagram.registerNode('HarnessApproval', DiamondNodeWidget)
diagram.registerNode('default-diamond', DiamondNodeWidget)
diagram.registerNode(['Barrier', 'ResourceConstraint'], IconNode)

export const CDPipelineStudioNew = diagram.render()
export interface ExecutionStageDetailsProps {
  layout: ExecutionLayoutState
  onStepSelect(step?: string): void
  onStageSelect(step: string): void
}

export default function ExecutionStageDetails(props: ExecutionStageDetailsProps): React.ReactElement {
  const {
    pipelineExecutionDetail,
    pipelineStagesMap,
    loading,
    selectedStageId,
    selectedStepId,
    allNodeMap,
    isDataLoadedForSelectedStage
  } = useExecutionContext()
  const { setStepDetailsVisibility } = useExecutionLayoutContext()
  const [barrierSetupId, setBarrierSetupId] = React.useState<string | undefined>()
  const [resourceUnit, setResourceUnit] = React.useState<string | undefined>()
  const [dynamicPopoverHandler, setDynamicPopoverHandler] = React.useState<
    DynamicPopoverHandlerBinding<unknown> | undefined
  >()

  const { executionIdentifier, accountId } = useParams<ExecutionPathProps>()
  const stage = pipelineStagesMap.get(selectedStageId)
  const {
    data: barrierInfo,
    loading: barrierInfoLoading,
    refetch: refetchBarrierInfo
  } = useGetBarrierInfo({
    lazy: true
  })
  const {
    data: resourceConstraintsData,
    loading: resourceConstraintsLoading,
    refetch: fetchResourceConstraints
  } = useGetResourceConstraintsExecutionInfo({
    lazy: true
  })
  const data: any = {
    //ExecutionPipeline<ExecutionNode> = {
    items: processExecutionDataV1(pipelineExecutionDetail?.executionGraph),
    identifier: `${executionIdentifier}-${pipelineExecutionDetail?.executionGraph?.rootNodeId}`,
    status: stage?.status as any,
    allNodes: Object.keys(allNodeMap)
  }

  const refetchBarrierInfoRef = React.useCallback(refetchBarrierInfo, [])

  React.useEffect(() => {
    diagram.registerListeners(
      getExecutionStageDiagramListeners({ onMouseEnter: onMouseEnterV1, allNodeMap, onMouseLeave, onStepSelect })
    )
  }, [dynamicPopoverHandler, allNodeMap])

  // load barrier info when barrier step is mouse over (when barrierSetupId is set)
  React.useEffect(() => {
    if (barrierSetupId) {
      refetchBarrierInfoRef({
        queryParams: {
          barrierSetupId: defaultTo(barrierSetupId, ''),
          planExecutionId: executionIdentifier
        }
      })
    }
  }, [barrierSetupId, refetchBarrierInfoRef])

  // TODO: consider removing debounce form next line
  const fetchResourceConstraintsRef = React.useCallback(debounce(fetchResourceConstraints, 1000), [])
  // load resource constrains when resource constrain step is mouse over (when resourceUnit is set)
  React.useEffect(() => {
    if (resourceUnit) {
      fetchResourceConstraintsRef({
        queryParams: {
          resourceUnit,
          accountId
        }
      })
    }
  }, [resourceUnit, fetchResourceConstraintsRef])

  // open details view when a step is selected
  React.useEffect(() => {
    setStepDetailsVisibility(!!selectedStepId)
  }, [selectedStepId, setStepDetailsVisibility])

  const onMouseLeave = (): void => {
    dynamicPopoverHandler?.hide()
    setBarrierSetupId(undefined)
  }

  const onStepSelect = (id: string): void => props.onStepSelect(id)

  const onMouseEnterV1 = ({ event, data: stageData }: { event: any; data: any }): void => {
    const isFinished = stageData?.endTs
    const hasStarted = stageData?.startTs
    const status = stageData?.status
    dynamicPopoverHandler?.show(
      event.target,
      {
        event,
        data: {
          data: stageData,
          module: stage?.module,
          moduleInfo: stage?.moduleInfo,
          when: stageData?.when || stageData?.data?.when
        }
      },
      { useArrows: true, darkMode: false, fixedPosition: false, placement: 'top' }
    )
    if (!isFinished && hasStarted) {
      if (stageData?.stepType === StepType.Barrier && status !== 'Success') {
        setBarrierSetupId(stageData?.setupId)
      }
      if (stageData?.stepType === StepType.ResourceConstraint) {
        setResourceUnit(stageData?.stepParameters?.spec?.resourceUnit)
      }
    }
  }
  const renderPopover = ({
    data: stepInfo
  }: {
    data: {
      data: {
        stepType: string
        startTs: number
        status: string
        stepParameters: { identifier: string }
        failureInfo: FailureInfo
      }
      when: NodeRunInfo
      module: string
      moduleInfo: {
        [key: string]: CDStageModuleInfo
      }
    }
  }): JSX.Element => {
    return (
      <HoverCard data={stepInfo}>
        {stepInfo?.when && <ConditionalExecutionTooltipWrapper data={stepInfo.when} mode={Modes.STEP} />}
        {stepInfo?.data?.stepType === StepType.Barrier && stepInfo?.data?.status === 'Running' && (
          <BarrierStepTooltip
            loading={barrierInfoLoading}
            data={{ ...barrierInfo?.data, stepParameters: stepInfo?.data?.stepParameters }}
            startTs={stepInfo?.data?.startTs}
          />
        )}
        {stepInfo?.data?.stepType === StepType.ResourceConstraint && stepInfo?.data?.status === 'ResourceWaiting' && (
          <ResourceConstraintTooltip
            loading={resourceConstraintsLoading}
            data={{
              executionList: resourceConstraintsData?.data?.resourceConstraints,
              ...stepInfo,
              executionId: executionIdentifier
            }}
          />
        )}
        {stepInfo?.data?.stepType === StepType.Verify && stepInfo?.data?.status === 'Skipped' && (
          <VerifyStepTooltip failureInfo={stepInfo?.data?.failureInfo} />
        )}
      </HoverCard>
    )
  }

  // NOTE: check if we show stop node when stage has paused status
  const showEndNode = !(isExecutionRunning(stage?.status) || isExecutionPaused(stage?.status))

  processExecutionDataV1(pipelineExecutionDetail?.executionGraph)
  return (
    <div className={cx(css.main, css.stepGroup)} data-layout={props.layout}>
      {!isEmpty(selectedStageId) && data.items?.length > 0 && (
        <NodeDimensionProvider>
          <CDPipelineStudioNew
            readonly
            loaderComponent={DiagramLoader}
            data={data.items}
            selectedNodeId={selectedStepId}
            panZoom={false}
            showEndNode={showEndNode}
            graphLinkClassname={css.graphLink}
          />
        </NodeDimensionProvider>
      )}
      {loading && !isDataLoadedForSelectedStage && pipelineExecutionDetail && <PageSpinner fixed={false} />}
      <DynamicPopover
        className={css.popoverHeight}
        darkMode={true}
        render={renderPopover}
        bind={setDynamicPopoverHandler as any}
        closeOnMouseOut
        usePortal
      />
    </div>
  )
}
