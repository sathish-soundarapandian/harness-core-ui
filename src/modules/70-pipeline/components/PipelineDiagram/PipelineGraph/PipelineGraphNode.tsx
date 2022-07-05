/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef, useState, useLayoutEffect, ForwardedRef } from 'react'
import { defaultTo, get, throttle } from 'lodash-es'
import classNames from 'classnames'
import { isNodeTypeMatrixOrFor } from '@pipeline/utils/executionUtils'
import GroupNode from '../Nodes/GroupNode/GroupNode'
import type {
  NodeCollapsibleProps,
  NodeDetails,
  NodeIds,
  PipelineGraphState,
  GetNodeMethod,
  CombinedNodeProps,
  FireEventMethod,
  BaseMetaDataType,
  TerminalNodeProps
} from '../types'
import { NodeType } from '../types'
import { useNodeResizeObserver } from '../hooks/useResizeObserver'
import { getRelativeBounds } from './PipelineGraphUtils'
import { isFirstNodeAGroupNode, isNodeParallel, shouldAttachRef, shouldRenderGroupNode, showChildNode } from './utils'
import css from './PipelineGraph.module.scss'

let IS_RENDER_OPTIMIZATION_ENABLED = true
export interface PipelineGraphRecursiveProps<T, U, V> {
  nodes?: PipelineGraphState<T, U, V>[]
  getNode: GetNodeMethod<T, U, V>
  getDefaultNode: GetNodeMethod<T, U, V>
  updateGraphLinks: () => void
  fireEvent: FireEventMethod<V>
  selectedNodeId: string
  uniqueNodeIds?: NodeIds
  startEndNodeNeeded?: boolean
  parentIdentifier?: string
  collapsibleProps?: NodeCollapsibleProps
  readonly?: boolean
  isDragging?: boolean
  optimizeRender?: boolean
  parentSelector?: string
  createNodeTitle?: string
  showEndNode?: boolean
}

export function PipelineGraphRecursive<T, U, V>({
  nodes,
  getNode,
  selectedNodeId,
  fireEvent,
  uniqueNodeIds,
  startEndNodeNeeded = true,
  updateGraphLinks,
  collapsibleProps,
  getDefaultNode,
  readonly = false,
  isDragging,
  optimizeRender = true,
  parentSelector,
  createNodeTitle,
  showEndNode
}: PipelineGraphRecursiveProps<T, U, V>): React.ReactElement {
  const StartNode: React.FC<CombinedNodeProps<T, U, V>> | undefined = getNode(NodeType.StartNode)?.component
  const CreateNode: React.FC<CombinedNodeProps<T, U, V>> | React.FC<TerminalNodeProps<V>> | undefined = getNode(
    NodeType.CreateNode
  )?.component
  const EndNode: React.FC<CombinedNodeProps<T, U, V>> | undefined = getNode(NodeType.EndNode)?.component
  const PipelineNodeComponent = optimizeRender ? PipelineGraphNodeObserved : PipelineGraphNodeBasic
  const commonProps = {
    getNode,
    fireEvent,
    getDefaultNode,
    updateGraphLinks
  }
  return (
    <div id="tree-container" className={classNames(css.graphTree, css.common)}>
      {StartNode && startEndNodeNeeded && (
        <StartNode
          {...commonProps}
          data={{ id: uniqueNodeIds?.startNode as string } as any}
          metaData={{ className: classNames(css.graphNode) }}
        />
      )}
      {nodes?.map((node, index) => {
        return (
          <PipelineNodeComponent
            {...commonProps}
            selectedNodeId={selectedNodeId}
            data={node}
            index={index}
            key={index}
            isNextNodeParallel={isNodeParallel(nodes?.[index + 1])} // not needed can be calculated from prevNode
            isPrevNodeParallel={isNodeParallel(nodes?.[index - 1])} // not needed can be calculated from prevNode
            nextNode={nodes?.[index + 1]}
            prevNode={nodes?.[index - 1]}
            collapsibleProps={collapsibleProps}
            readonly={readonly}
            isDragging={isDragging}
            parentSelector={parentSelector}
          />
        )
      })}
      {CreateNode && startEndNodeNeeded && !readonly && (
        <CreateNode
          {...commonProps}
          id={uniqueNodeIds?.createNode as string}
          identifier={uniqueNodeIds?.createNode}
          name={createNodeTitle || 'Add'}
          fireEvent={fireEvent}
        />
      )}
      {EndNode && showEndNode && startEndNodeNeeded && (
        <EndNode id={uniqueNodeIds?.endNode as string} className={classNames(css.graphNode)} />
      )}
    </div>
  )
}

interface PipelineGraphNodeWithoutCollapseProps<T, U, V> {
  className?: string
  data: PipelineGraphState<T, U, V>
  fireEvent: FireEventMethod<V>
  getNode: GetNodeMethod<T, U, V>
  selectedNodeId: string
  isParallelNode?: boolean
  isNextNodeParallel?: boolean
  isPrevNodeParallel?: boolean
  isLastChild?: boolean
  parentIdentifier?: string
  nextNode?: PipelineGraphState<T, U, V>
  prevNode?: PipelineGraphState<T, U, V>
  updateGraphLinks: () => void
  getDefaultNode(): NodeDetails<T, U, V> | null
  collapseOnIntersect?: boolean
  intersectingIndex?: number
  readonly?: boolean
  parentSelector?: string
  ref?: ForwardedRef<HTMLDivElement>
}

function PipelineGraphNodeWithoutCollapseWithRef<T, U, V>(
  {
    fireEvent,
    getNode,
    data,
    className,
    isLastChild,
    selectedNodeId,
    isParallelNode,
    isNextNodeParallel,
    isPrevNodeParallel,
    parentIdentifier,
    prevNode,
    nextNode,
    updateGraphLinks,
    collapseOnIntersect,
    getDefaultNode,
    intersectingIndex = -1,
    readonly
  }: PipelineGraphNodeWithoutCollapseProps<T, U, V>,
  ref: ForwardedRef<HTMLDivElement>
): React.ReactElement | null {
  const defaultNode = getDefaultNode()?.component
  const NodeComponent: React.FC<CombinedNodeProps<T, U, V>> = defaultTo(
    getNode?.(data?.type)?.component,
    defaultNode
  ) as React.FC<CombinedNodeProps<T, U, V>>

  const readOnlyValue = readonly || data.readonly

  const refValue = React.useMemo((): React.ForwardedRef<HTMLDivElement> | null => {
    return intersectingIndex === 0 && data.children && collapseOnIntersect ? ref : null
  }, [intersectingIndex, data.children, collapseOnIntersect, ref])
  const commonProps = {
    getNode,
    fireEvent,
    getDefaultNode,
    updateGraphLinks
  }
  const nodeMetaData: BaseMetaDataType<T, U, V> = {
    nextNode,
    prevNode,
    parentIdentifier,
    isParallelNode,
    className: classNames(css.graphNode, className)
  }
  return (
    <div
      className={classNames(
        'pipeline-graph-node',
        { [css.nodeRightPadding]: isNextNodeParallel, [css.nodeLeftPadding]: isPrevNodeParallel },
        css.node
      )}
    >
      <>
        <div id={`ref_${data?.identifier}`} ref={refValue} key={data?.identifier} data-index={0}>
          {isFirstNodeAGroupNode(intersectingIndex, collapseOnIntersect, data?.children?.length) ? (
            <GroupNode
              {...commonProps}
              metaData={nodeMetaData}
              key={data?.identifier}
              permissions={{ allowAdd: true, readonly: readOnlyValue }}
              // intersectingIndex={intersectingIndex}

              selectedNodeId={selectedNodeId}
              data={data as any}
            />
          ) : (
            <NodeComponent
              {...commonProps}
              metaData={{ ...nodeMetaData, isFirstParallelNode: true }}
              key={data?.identifier}
              permissions={{
                allowAdd: (!data?.children?.length && !isParallelNode) || (isParallelNode && isLastChild),
                readonly: readOnlyValue
              }}
              selectedNodeId={selectedNodeId}
              data={data}
            />
          )}
        </div>
        {/* render child nodes */}
        {data?.children?.map((currentNodeData, index) => {
          const ChildNodeComponent: React.FC<CombinedNodeProps<T, U, V>> = defaultTo(
            getNode?.(currentNodeData?.type)?.component,
            defaultNode
          ) as React.FC<CombinedNodeProps<T, U, V>>
          const lastChildIndex = defaultTo(data.children?.length, 0) - 1
          const indexRelativeToParent = index + 1 // counting parent as 0 and children from 1
          const isCurrentChildLast = index === lastChildIndex
          const attachRef = shouldAttachRef(intersectingIndex, isCurrentChildLast, indexRelativeToParent)
          return !collapseOnIntersect ? (
            <ChildNodeComponent
              {...commonProps}
              metaData={{ ...nodeMetaData, isFirstParallelNode: true, isParallelNode: true }}
              key={currentNodeData?.identifier}
              permissions={{
                allowAdd: indexRelativeToParent === data?.children?.length,
                readonly: readOnlyValue
              }}
              selectedNodeId={selectedNodeId}
              data={currentNodeData}
            />
          ) : (
            <div
              ref={attachRef ? ref : null}
              data-index={indexRelativeToParent}
              id={`ref_${currentNodeData?.identifier}`}
              key={currentNodeData?.identifier}
            >
              {shouldRenderGroupNode(attachRef, isCurrentChildLast) ? (
                <GroupNode
                  {...commonProps}
                  data={data}
                  metaData={{ ...nodeMetaData, isParallelNode: true }}
                  key={currentNodeData?.identifier}
                  permissions={{
                    allowAdd: true,
                    readonly: readOnlyValue
                  }}
                  // intersectingIndex={intersectingIndex}
                  selectedNodeId={selectedNodeId}
                />
              ) : showChildNode(indexRelativeToParent, intersectingIndex) ? (
                <ChildNodeComponent
                  {...commonProps}
                  data={currentNodeData}
                  metaData={{ ...nodeMetaData, isParallelNode: true }}
                  key={currentNodeData?.identifier}
                  permissions={{
                    allowAdd: index + 1 === data?.children?.length,
                    readonly: readOnlyValue
                  }}
                  selectedNodeId={selectedNodeId}
                />
              ) : null}
            </div>
          )
        })}
      </>
    </div>
  )
}

const PipelineGraphNodeWithoutCollapse = React.forwardRef(
  PipelineGraphNodeWithoutCollapseWithRef
) as typeof PipelineGraphNodeWithoutCollapseWithRef

// PipelineGraphNodeWithoutCollapse.displayName = 'PipelineGraphNodeWithoutCollapse'

function PipelineGraphNodeWithCollapse<T, U, V>(
  props: PipelineGraphNodeWithoutCollapseProps<T, U, V> & {
    collapsibleProps?: NodeCollapsibleProps
    parentSelector?: string
  }
): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null)
  const resizeState = useNodeResizeObserver(ref?.current, props.collapsibleProps, props.parentSelector)
  const [intersectingIndex, setIntersectingIndex] = useState<number>(-1)

  useLayoutEffect(() => {
    const element = defaultTo(ref?.current, ref) as HTMLElement
    if (resizeState.shouldCollapse) {
      const indexToGroupFrom = Number(defaultTo(element?.dataset.index, -1))
      Number.isInteger(indexToGroupFrom) && indexToGroupFrom > 0 && setIntersectingIndex(indexToGroupFrom - 1)
    }

    if (resizeState.shouldExpand) {
      if (intersectingIndex < (props.data?.children?.length as number)) {
        const indexToGroupFrom = Number(defaultTo(element?.dataset.index, -1))
        Number.isInteger(indexToGroupFrom) &&
          indexToGroupFrom < (props.data.children as unknown as [])?.length &&
          setIntersectingIndex(indexToGroupFrom + 1)
      }
    }
  }, [resizeState])

  useLayoutEffect(() => {
    props.updateGraphLinks?.()
  }, [intersectingIndex])
  const commonProps = {
    getNode: props?.getNode,
    fireEvent: props?.fireEvent,
    getDefaultNode: props?.getDefaultNode,
    updateGraphLinks: props?.updateGraphLinks
  }
  return (
    <PipelineGraphNodeWithoutCollapse
      {...commonProps}
      data={props?.data}
      selectedNodeId={props?.selectedNodeId}
      ref={ref}
      intersectingIndex={intersectingIndex}
      collapseOnIntersect={true}
    />
  )
}
interface PipelineGraphNodeBasicProps<T, U, V> extends PipelineGraphNodeWithoutCollapseProps<T, U, V> {
  collapsibleProps?: NodeCollapsibleProps
}
function PipelineGraphNodeBasic<T, U, V>(props: PipelineGraphNodeBasicProps<T, U, V>): React.ReactElement {
  const commonProps = {
    getNode: props?.getNode,
    fireEvent: props?.fireEvent,
    getDefaultNode: props?.getDefaultNode,
    updateGraphLinks: props?.updateGraphLinks
  }
  return props?.collapsibleProps ? (
    <PipelineGraphNodeWithCollapse {...props} />
  ) : (
    <PipelineGraphNodeWithoutCollapse
      data={props?.data}
      selectedNodeId={props?.selectedNodeId}
      collapseOnIntersect={true}
      {...commonProps}
    />
  )
}
const PipelineGraphNode = React.memo(PipelineGraphNodeBasic) as typeof PipelineGraphNodeBasic

function PipelineGraphNodeObserved<T, U, V>(
  props: PipelineGraphNodeBasicProps<T, U, V> & { index: number; isDragging?: boolean }
): React.ReactElement {
  const [ref, setRef] = useState<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(true)
  const updateVisibleState = React.useCallback(throttle(setVisible, 200), [])
  const [elementRect, setElementRect] = useState<DOMRect | null>(null)
  // execution view)
  if (get(props?.data?.data, 'loopingStrategyEnabled') || isNodeTypeMatrixOrFor(get(props?.data, 'type'))) {
    IS_RENDER_OPTIMIZATION_ENABLED = false
  }

  React.useEffect(() => {
    let observer: IntersectionObserver
    if (ref && props?.parentSelector && IS_RENDER_OPTIMIZATION_ENABLED) {
      const rootElement = document.querySelector(props?.parentSelector as string)

      observer = new IntersectionObserver(
        (entries, _observer) => {
          entries.forEach((entry: IntersectionObserverEntry) => {
            const computedEntryEl = getRelativeBounds(rootElement as HTMLDivElement, document.body)
            const computedEntryRoot = getRelativeBounds(entry.target as HTMLElement, document.body)
            if (computedEntryEl.right > computedEntryRoot.right || computedEntryEl.left < computedEntryRoot.left) {
              if (entry.isIntersecting) {
                updateVisibleState(true)
              } else {
                !props.isDragging && updateVisibleState(false)
              }
            } else {
              updateVisibleState(true)
            }
          })
        },
        { threshold: 0.5, root: rootElement }
      )
      observer.observe(ref as HTMLDivElement)
    }
    return () => {
      if (observer && ref && IS_RENDER_OPTIMIZATION_ENABLED) observer.unobserve(ref as HTMLDivElement)
    }
  }, [ref, elementRect, props?.isDragging])

  React.useEffect(() => {
    if (!elementRect && ref !== null) {
      const elementDOMRect = ref?.getBoundingClientRect() as DOMRect
      setElementRect(elementDOMRect)
    }
  }, [ref])

  return (
    <div data-graph-node={props.index} ref={setRef}>
      {IS_RENDER_OPTIMIZATION_ENABLED && <div style={{ width: elementRect?.width, visibility: 'hidden' }} />}
      {visible ? <PipelineGraphNode {...props} /> : null}
    </div>
  )
}
export { PipelineGraphNode }
