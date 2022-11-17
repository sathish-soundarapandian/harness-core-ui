/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty, get } from 'lodash-es'
import { Icon, Layout, Text } from '@harness/uicore'
import { Intent, Color } from '@harness/design-system'
import { NodeRunInfo, useGetBarriersExecutionInfo } from 'services/pipeline-ng'
import {
  isNodeTypeMatrixOrFor,
  processExecutionDataForGraph,
  processLayoutNodeMapV1
} from '@pipeline/utils/executionUtils'
import { ExecutionStatus, isExecutionIgnoreFailed } from '@pipeline/utils/statusHelpers'
import { useStrings } from 'framework/strings'
import type { DynamicPopoverHandlerBinding } from '@common/components/DynamicPopover/DynamicPopover'
import { DynamicPopover } from '@common/exports'
import HoverCard from '@pipeline/components/HoverCard/HoverCard'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { ExecutionPathProps } from '@common/interfaces/RouteInterfaces'
import ConditionalExecutionTooltipWrapper from '@pipeline/components/ConditionalExecutionToolTip/ConditionalExecutionTooltipWrapper'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import type { PipelineGraphState } from '@pipeline/components/PipelineDiagram/types'
import {
  DiagramFactory,
  NodeType as DiagramNodeType,
  BaseReactComponentProps
} from '@pipeline/components/PipelineDiagram/DiagramFactory'
import { DiamondNodeWidget } from '@pipeline/components/PipelineDiagram/Nodes/DiamondNode/DiamondNode'
import PipelineStageNode from '@pipeline/components/PipelineDiagram/Nodes/DefaultNode/PipelineStageNode/PipelineStageNode'
import CreateNodeStage from '@pipeline/components/PipelineDiagram/Nodes/CreateNode/CreateNodeStage'
import EndNodeStage from '@pipeline/components/PipelineDiagram/Nodes/EndNode/EndNodeStage'
import StartNodeStage from '@pipeline/components/PipelineDiagram/Nodes/StartNode/StartNodeStage'
import { getExecutionStageDiagramListeners } from '@pipeline/utils/execUtils'
import DiagramLoader from '@pipeline/components/DiagramLoader/DiagramLoader'
import { MatrixNode } from '@pipeline/components/PipelineDiagram/Nodes/MatrixNode/MatrixNode'
import CDInfo from './components/CD/CDInfo/CDInfo'
import css from './ExecutionGraph.module.scss'

const diagram = new DiagramFactory('graph')
diagram.registerNode(['Deployment', 'CI'], PipelineStageNode as unknown as React.FC<BaseReactComponentProps>, true)
diagram.registerNode(DiagramNodeType.CreateNode, CreateNodeStage as unknown as React.FC<BaseReactComponentProps>)
diagram.registerNode(DiagramNodeType.EndNode, EndNodeStage)
diagram.registerNode(DiagramNodeType.StartNode, StartNodeStage)
diagram.registerNode([DiagramNodeType.MatrixNode, DiagramNodeType.LoopNode, DiagramNodeType.PARALLELISM], MatrixNode)
diagram.registerNode(['Approval', 'JiraApproval', 'HarnessApproval', 'default-diamond'], DiamondNodeWidget)

export const CDPipelineStudioNew = diagram.render()
const barrierSupportedStageTypes = [StageType.DEPLOY, StageType.APPROVAL]

export interface ExecutionGraphProps {
  onSelectedStage(stage: string, stageExecId?: string): void
}

export default function ExecutionGraph(props: ExecutionGraphProps): React.ReactElement {
  const { executionIdentifier } = useParams<ExecutionPathProps>()
  const { getString } = useStrings()
  const [dynamicPopoverHandler, setDynamicPopoverHandler] = React.useState<
    DynamicPopoverHandlerBinding<unknown> | undefined
  >()
  const [stageSetupId, setStageSetupIdId] = React.useState('')
  const { pipelineExecutionDetail, selectedStageId } = useExecutionContext()

  const nodeData = useMemo(
    () => processLayoutNodeMapV1(pipelineExecutionDetail?.pipelineExecutionSummary),
    [pipelineExecutionDetail?.pipelineExecutionSummary]
  )
  const data: any = useMemo(() => {
    //ExecutionPipeline<GraphLayoutNode> | ExecutionPipeline<PipelineGraphState>
    return {
      items: processExecutionDataForGraph(nodeData as PipelineGraphState[]),
      identifier:
        pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier || /* istanbul ignore next */ '',
      status: pipelineExecutionDetail?.pipelineExecutionSummary?.status as any,
      allNodes: Object.keys(pipelineExecutionDetail?.pipelineExecutionSummary?.layoutNodeMap || {})
    }
  }, [nodeData])

  const {
    data: barrierInfoData,
    refetch: fetchBarrierInfo,
    loading: barrierInfoLoading
  } = useGetBarriersExecutionInfo({
    lazy: true
  })

  React.useEffect(() => {
    diagram.registerListeners(
      getExecutionStageDiagramListeners({
        allNodeMap: pipelineExecutionDetail?.pipelineExecutionSummary?.layoutNodeMap,
        onMouseLeave: () => {
          dynamicPopoverHandler?.hide()
          setStageSetupIdId('')
        },
        onMouseEnter: onMouseEnterV1,
        onStepSelect: (id: string, stageExecId?: string) => props.onSelectedStage(id, stageExecId)
      })
    )
  }, [pipelineExecutionDetail?.pipelineExecutionSummary?.layoutNodeMap, dynamicPopoverHandler])

  React.useEffect(() => {
    if (stageSetupId) {
      fetchBarrierInfo({
        queryParams: {
          stageSetupId: stageSetupId,
          planExecutionId: executionIdentifier
        }
      })
    }
  }, [stageSetupId, executionIdentifier])

  const onMouseEnterV1 = ({ event, data: stageData }: { event: any; data: any }): void => {
    const currentStage = { stageData, data: stageData } as any
    const isFinished = currentStage?.endTs
    const hasStarted = currentStage?.startTs

    dynamicPopoverHandler?.show(
      event.target,
      {
        event,
        data: currentStage
      },
      { useArrows: true, darkMode: false, fixedPosition: false, placement: 'top' }
    )
    if (!isFinished && hasStarted) {
      setStageSetupIdId(currentStage?.nodeUuid)
    }
  }
  const renderPopover = ({
    data: popoverData
  }: {
    data: {
      identifier: string
      stepType: string
      name: string
      status: ExecutionStatus
      data: { failureInfo?: { message: string } }
      when: NodeRunInfo
    }
  }): JSX.Element => {
    return (
      <HoverCard data={popoverData}>
        {popoverData?.when && <ConditionalExecutionTooltipWrapper data={popoverData.when} mode={Modes.STAGE} />}
        {barrierSupportedStageTypes.indexOf(get(popoverData, 'data.nodeType', '')) !== -1 && (
          <CDInfo barrier={{ barrierInfoLoading, barrierData: barrierInfoData }} data={popoverData} />
        )}
      </HoverCard>
    )
  }

  const isMatrixNode = React.useCallback((): boolean => {
    let isMatrixNodePresent = false
    data?.items?.forEach((obj: PipelineGraphState) => {
      if (isNodeTypeMatrixOrFor(get(obj, 'type'))) {
        isMatrixNodePresent = true
        return
      }
      obj?.children?.forEach((parallelNode: PipelineGraphState) => {
        if (isNodeTypeMatrixOrFor(get(parallelNode, 'type'))) {
          isMatrixNodePresent = true
          return
        }
      })
    })
    return isMatrixNodePresent
  }, [data?.items])

  return (
    <div className={css.main}>
      {isExecutionIgnoreFailed(pipelineExecutionDetail?.pipelineExecutionSummary?.status) ? (
        <Layout.Horizontal spacing="medium" background={Color.GREY_200} className={css.executionError}>
          <Icon name="warning-sign" intent={Intent.WARNING} />
          <Text lineClamp={1}>{getString('pipeline.execution.ignoreFailedWarningText')}</Text>
        </Layout.Horizontal>
      ) : null}
      {!isEmpty(pipelineExecutionDetail?.pipelineExecutionSummary?.executionErrorInfo?.message) ? (
        <Layout.Horizontal spacing="medium" background={Color.RED_100} className={css.executionError}>
          <Icon name="warning-sign" intent={Intent.DANGER} />
          <Text color={Color.GREY_900} lineClamp={1}>
            {pipelineExecutionDetail?.pipelineExecutionSummary?.executionErrorInfo?.message}
          </Text>
        </Layout.Horizontal>
      ) : null}
      {!isEmpty(pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier) && data.items?.length > 0 && (
        <>
          <CDPipelineStudioNew
            readonly
            loaderComponent={DiagramLoader}
            data={data.items as PipelineGraphState[]}
            selectedNodeId={selectedStageId}
            panZoom={false}
            parentSelector=".Pane1"
            {...(!isMatrixNode() && { collapsibleProps: { percentageNodeVisible: 0.8, bottomMarginInPixels: 120 } })}
            graphLinkClassname={css.graphLink}
            key={executionIdentifier}
          />

          <DynamicPopover
            darkMode={true}
            render={renderPopover}
            bind={setDynamicPopoverHandler as any}
            closeOnMouseOut
          />
        </>
      )}
    </div>
  )
}
