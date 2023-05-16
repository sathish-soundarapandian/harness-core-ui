/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef, useMemo } from 'react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import highChartsNetworkGraph from 'highcharts/modules/networkgraph'
import type { UseStringsReturn } from 'framework/strings';
import { useStrings } from 'framework/strings'
import type { VisEdge, VisGraph, VisNode } from 'services/ti-service'
import css from './BuildTests.module.scss'

const CALL_GRAPH_CHART_ID = 'ti-call-graph-chart'
const CALL_GRAPH_CHART_NORMAL_NODE_SIZE_PREVIEW = 7
const CALL_GRAPH_CHART_NORMAL_NODE_SIZE_MODAL = 10
const CALL_GRAPH_CHART_ROOT_NODE_SIZE_PREVIEW = 40
const CALL_GRAPH_CHART_ROOT_NODE_SIZE_MODAL = 80
const NOT_IMPORTANT_NODE_COLOR = '#D9DAE6'

export type CallGraphAPIResponseNode = Required<VisNode>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnknownHighChartType = any

export interface CallGraphAPIResponseEgde {
  from: CallGraphAPIResponseNode['id']
  to: Array<CallGraphAPIResponseNode['id']>
}

export type CallGraphAPIResponse = Required<VisGraph>

export interface NetworkChartLink {
  from: number
  to: number
  fromRoot?: boolean
  color?: string
  dashStyle?: string
  custom?: Record<string, UnknownHighChartType>
  halo?: Record<string, UnknownHighChartType> | null
}

// When handling huge number of nodes, Highcharts needs global Highcharts to do garbage collection
// which is not available in app bundle, causing the whole app to crash
window.Highcharts = Highcharts
highChartsNetworkGraph(Highcharts)
highChartsArrows(Highcharts)

const isNodeMatchedSearch = (node: CallGraphAPIResponseNode, searchTerm?: string): boolean =>
  searchTerm && node
    ? node.class?.includes?.(searchTerm) ||
      node.package?.includes?.(searchTerm) ||
      node.file?.includes?.(searchTerm) ||
      node.type?.includes?.(searchTerm)
    : false

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const makeLinearGradient = (fromColor: string, toColor: string) => ({
  linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
  stops: [
    [0, fromColor],
    [1, toColor]
  ]
})

const rootSymbol =
  'url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiB2aWV3Qm94PSIwIDAgNDUgNDQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxmaWx0ZXIgaWQ9ImEiIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0ic1JHQiIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBoZWlnaHQ9IjQzLjA2MTYiIHdpZHRoPSI0My44MzciIHg9Ii45OTQxNDEiIHk9Ii4yNDE2OTkiPjxmZUZsb29kIGZsb29kLW9wYWNpdHk9IjAiIHJlc3VsdD0iQmFja2dyb3VuZEltYWdlRml4Ii8+PGZlQ29sb3JNYXRyaXggaW49IlNvdXJjZUFscGhhIiByZXN1bHQ9ImhhcmRBbHBoYSIgdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDEyNyAwIi8+PGZlT2Zmc2V0IGR5PSIyIi8+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iNiIvPjxmZUNvbG9yTWF0cml4IHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAuNzU1MTU1IDAgMCAwIDAgMC41MzQ4NzUgMCAwIDAgMCAwLjgyNSAwIDAgMCAwLjE2IDAiLz48ZmVCbGVuZCBpbjI9IkJhY2tncm91bmRJbWFnZUZpeCIgbW9kZT0ibm9ybWFsIiByZXN1bHQ9ImVmZmVjdDFfZHJvcFNoYWRvdyIvPjxmZUNvbG9yTWF0cml4IGluPSJTb3VyY2VBbHBoYSIgcmVzdWx0PSJoYXJkQWxwaGEiIHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAxMjcgMCIvPjxmZU9mZnNldC8+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iLjUiLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMCAwIDAgMCAwLjYyMzUyOSAwIDAgMCAwIDAuMzAxOTYxIDAgMCAwIDAgMC43MjU0OSAwIDAgMCAwLjA0IDAiLz48ZmVCbGVuZCBpbjI9ImVmZmVjdDFfZHJvcFNoYWRvdyIgbW9kZT0ibm9ybWFsIiByZXN1bHQ9ImVmZmVjdDJfZHJvcFNoYWRvdyIvPjxmZUJsZW5kIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9ImVmZmVjdDJfZHJvcFNoYWRvdyIgbW9kZT0ibm9ybWFsIiByZXN1bHQ9InNoYXBlIi8+PC9maWx0ZXI+PGxpbmVhckdyYWRpZW50IGlkPSJiIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjE2LjE5OCIgeDI9IjI2LjAwNjciIHkxPSI5Ljc2OTUzIiB5Mj0iMjkuNzA4NiI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjYmVhMWZmIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjOGEzNmZmIi8+PC9saW5lYXJHcmFkaWVudD48ZyBmaWx0ZXI9InVybCgjYSkiPjxwYXRoIGQ9Im0yMS43MzcgMTAuNjIzNmMuNzAxLS41MDkzIDEuNjUwMi0uNTA5MyAyLjM1MTIgMGw3LjkxODMgNS43NTNjLjcwMS41MDkzLjk5NDMgMS40MTIxLjcyNjYgMi4yMzYxbC0zLjAyNDYgOS4zMDg2Yy0uMjY3Ny44MjQtMS4wMzU2IDEuMzgyLTEuOTAyMSAxLjM4MmgtOS43ODc2Yy0uODY2NCAwLTEuNjM0NC0uNTU4LTEuOTAyMS0xLjM4MmwtMy4wMjQ1LTkuMzA4NmMtLjI2NzgtLjgyNC4wMjU1LTEuNzI2OC43MjY1LTIuMjM2MXoiIGZpbGw9InVybCgjYikiLz48L2c+PC9zdmc+)'
const rootBackgroundColor = makeLinearGradient('#bea1ff', '#8a36ff')

// Add the nodes option through an event call. We want to start with the parent
// item and apply separate colors to each child element, then the same color to
// grandchildren.
Highcharts.addEvent(Highcharts.Series, 'afterSetOptions', function (e: UnknownHighChartType) {
  const nodes: Record<string, UnknownHighChartType> = {}

  if (
    this instanceof (Highcharts as UnknownHighChartType).seriesTypes.networkgraph &&
    e.options.id === CALL_GRAPH_CHART_ID
  ) {
    if (e.options.data.length === 1 && e.options.data[0].from === e.options.data[0].to) {
      const link = e.options.data[0]
      nodes[link.from] = {
        id: link.from,
        marker: {
          width: link.custom?.preview ? CALL_GRAPH_CHART_ROOT_NODE_SIZE_PREVIEW : CALL_GRAPH_CHART_ROOT_NODE_SIZE_MODAL,
          height: link.custom?.preview
            ? CALL_GRAPH_CHART_ROOT_NODE_SIZE_PREVIEW
            : CALL_GRAPH_CHART_ROOT_NODE_SIZE_MODAL,
          symbol: rootSymbol
        },
        color: rootBackgroundColor,
        node: {
          isRoot: true,
          noEdges: true
        }
      }
    } else {
      e.options.data.forEach(function (link: NetworkChartLink) {
        const marker = {
          radius: link.custom?.preview
            ? CALL_GRAPH_CHART_NORMAL_NODE_SIZE_PREVIEW
            : CALL_GRAPH_CHART_NORMAL_NODE_SIZE_MODAL
        }
        const matchedSearchTermColor = makeLinearGradient('#ffdd00', '#fbb034')
        const color = link.custom?.important ? makeLinearGradient('#73dfe7', '#0095f7') : NOT_IMPORTANT_NODE_COLOR

        nodes[link.from] = nodes[link.from] || {
          id: link.from,
          marker: link.fromRoot
            ? {
                width: link.custom?.preview
                  ? CALL_GRAPH_CHART_ROOT_NODE_SIZE_PREVIEW
                  : CALL_GRAPH_CHART_ROOT_NODE_SIZE_MODAL,
                height: link.custom?.preview
                  ? CALL_GRAPH_CHART_ROOT_NODE_SIZE_PREVIEW
                  : CALL_GRAPH_CHART_ROOT_NODE_SIZE_MODAL,
                symbol: rootSymbol
              }
            : marker,
          color: link.fromRoot
            ? rootBackgroundColor
            : isNodeMatchedSearch(link.custom?.fromNode, link.custom?.searchTerm)
            ? matchedSearchTermColor
            : color,
          node: {
            ...link.custom?.fromNode,
            isRoot: link.fromRoot
          }
        }

        nodes[link.to] = nodes[link.to] || {
          id: link.to,
          marker,
          color: isNodeMatchedSearch(link.custom?.toNode, link.custom?.searchTerm) ? matchedSearchTermColor : color,
          node: link.custom?.toNode
        }
      })
    }

    e.options.nodes = Object.keys(nodes).map(id => nodes[id])
  }
})

const renderRow = (name: string, value: string): string =>
  value
    ? `
<dl class=${css.listRow}>
  <dt class=${css.listName}>${name}</dt>
  <dd class=${css.listValue}>${value}</dd>
</dl>`
    : ''

const renderNodeTooltip = (node: UnknownHighChartType, getString: UseStringsReturn['getString']): string => `
<div class=${css.callgraphTooltip}>
  <p class=${css.sourceMethod}>${getString(
  node.class ? 'pipeline.testsReports.sourceMethod' : 'common.resourceLabel'
).toUpperCase()}</p>
  <p class=${css.methodName}>${node.class || node.file || ''}</p>
  <div>
    ${renderRow(getString('common.ID'), node.id)}
    ${renderRow(getString('pipeline.testsReports.callgraphField.package'), node.package)}
    ${renderRow(getString('pipeline.testsReports.callgraphField.class'), node.class)}
    ${renderRow(getString('pipeline.testsReports.callgraphField.file'), node.file)}
    ${renderRow(getString('pipeline.testsReports.callgraphField.type'), node.type)}
  </div>
</div>
`

export interface TestsCallgraphProps {
  selectedClass: string
  graph: CallGraphAPIResponse
  preview?: boolean
  searchTerm?: string
  onNodeClick: () => void
}

function TestsCallgraphComponent({
  graph,
  selectedClass,
  preview,
  onNodeClick,
  searchTerm
}: TestsCallgraphProps): React.ReactElement {
  const { getString } = useStrings()
  const chartRef = useRef<UnknownHighChartType>(null)
  const options: Highcharts.Options | Record<string, unknown> = useMemo(
    () => ({
      title: {
        text: undefined
      },
      credits: {
        enabled: false
      },
      tooltip: {
        stickOnContact: true,
        enabled: true,
        useHTML: true,
        backgroundColor: '#ffffff',
        borderColor: 'transparent',
        borderRadius: 8,
        borderWidth: 1,
        style: {
          pointerEvents: 'auto'
        },
        formatter: function () {
          // Required for showing a tooltip on click instead of hover
          if (!(this.point.series.chart.tooltip as any).customEnabled) return false

          const node: UnknownHighChartType = (this as UnknownHighChartType).point?.node
          return preview || node?.noEdges
            ? node?.isRoot
              ? selectedClass
              : node?.class || node?.file
            : renderNodeTooltip(node, getString)
        }
      },
      chart: {
        type: 'networkgraph',
        height: preview ? '100%' : window.innerHeight - 315,
        width: preview ? undefined : window.innerWidth - 200,
        animation: true
      },
      plotOptions: {
        networkgraph: {
          keys: ['from', 'to'],
          layoutAlgorithm: {
            // TODO: For some reason, when enableSimulation = false, dragging
            // nodes breaks layout
            enableSimulation: !searchTerm,
            friction: -0.9,
            initialPositions: 'circle',
            maxIterations: 100
          }
        }
      },
      series: [
        {
          link: {
            color: NOT_IMPORTANT_NODE_COLOR
          },
          dataLabels: {
            enabled: false,
            allowOverlap: false
          },
          id: CALL_GRAPH_CHART_ID,
          data: buildNetworkChartLinksFromResponse({ graph, preview, searchTerm }),
          events: {
            click: function () {
              // Required for showing a tooltip on click instead of hover
              const chart = this.chart as any
              chart.tooltip.customEnabled = true
              chart.tooltip.refresh(chart.hoverPoint)

              onNodeClick()
            },
            mouseOut: function () {
              // Required for showing a tooltip on click instead of hover
              const tooltip = this.chart.tooltip as any
              if (!tooltip.isHidden) {
                tooltip.customEnabled = false
                tooltip.hide()
              }
            }
          }
        }
      ]
    }),
    [graph, preview, onNodeClick, searchTerm, getString, selectedClass]
  )

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      ref={chartRef}
      immutable={true}
      updateArgs={[false, false, false]}
    />
  )
}

export function buildNetworkChartLinksFromResponse({
  graph,
  preview,
  searchTerm
}: {
  graph: CallGraphAPIResponse
  preview?: boolean
  searchTerm?: string
}): NetworkChartLink[] {
  type NodesMapping = Record<number, CallGraphAPIResponseNode>
  let rootNode: Required<VisNode> | undefined
  const unprocessedNodeIds: Record<number, boolean> = {} // used to track orphan nodes
  const nodesMap: NodesMapping =
    graph?.nodes?.reduce((map, node) => {
      const _node = node as CallGraphAPIResponseNode

      map[_node.id] = _node
      unprocessedNodeIds[_node.id] = true

      if (_node.root) {
        rootNode = _node
      }

      return map
    }, {} as NodesMapping) || {}
  const links: NetworkChartLink[] = []

  if (rootNode) {
    graph?.edges?.forEach(edge => {
      const _edge = edge as Required<VisEdge>

      for (const _to of _edge.to) {
        if (nodesMap[_edge.from] && nodesMap[_to]) {
          const fromNode = nodesMap[_edge.from]
          const toNode = nodesMap[_to]
          const linkFromId = preview ? rootNode?.id || 0 : fromNode.id // in prmethodeview, all connected to root node
          const dashStyle = preview && fromNode !== rootNode ? 'Dash' : undefined

          if (toNode.important || !preview) {
            if (preview) {
              const existingLink = links.find(link => link.from === linkFromId && link.to === toNode.id)

              // In preview mode, if a link (direct to indirect) from root to toNode exists already
              // then skip adding the duplication
              if (existingLink) {
                // Also check if existing link has a dash line, and the potential (duplicated) link does not, then
                // change the existing link to solid line
                if (!dashStyle && existingLink.dashStyle) {
                  delete existingLink.dashStyle
                }

                continue
              }
            }

            links.push({
              from: linkFromId,
              to: toNode.id,
              fromRoot: preview || fromNode === rootNode,
              color: toNode.important ? undefined : NOT_IMPORTANT_NODE_COLOR,
              halo: null,
              dashStyle,
              custom: {
                important: toNode.important,
                fromNode: fromNode,
                toNode: toNode,
                preview,
                searchTerm
              }
            })
          }

          delete unprocessedNodeIds[fromNode.id]
          delete unprocessedNodeIds[toNode.id]
        }
      }
    })

    // In the API response, some nodes might be not connected to anything. We need to connect them to root
    // with a dash line
    Object.keys(unprocessedNodeIds).forEach(key => {
      const nodeId = Number(key)
      const toNode = nodesMap[nodeId]

      if (toNode.important || !preview) {
        links.push({
          from: rootNode?.id || 0,
          to: toNode.id,
          fromRoot: true,
          color: toNode.important ? undefined : NOT_IMPORTANT_NODE_COLOR,
          halo: null,
          dashStyle: 'Dash',
          custom: {
            important: toNode.important,
            fromNode: rootNode,
            toNode: toNode,
            preview,
            searchTerm
          }
        })
      }
    })
  }

  if (!links.length) {
    links.push({
      from: 0,
      to: 0,
      fromRoot: true,
      halo: null,
      custom: {
        preview,
        searchTerm
      }
    })
  }

  return links
}

// custom wrapper that allows to have
// arrow-shaped links
function highChartsArrows(H: UnknownHighChartType): void {
  H.wrap(
    H.seriesTypes.networkgraph.prototype.pointClass.prototype,
    'getLinkPath',
    function (this: UnknownHighChartType) {
      const left = this.fromNode,
        right = this.toNode

      const angle = Math.atan((left.plotX - right.plotX) / (left.plotY - right.plotY))

      if (angle) {
        const path = ['M', left.plotX, left.plotY, right.plotX, right.plotY],
          nextLastPoint = right,
          pointRadius = right?.marker?.radius || CALL_GRAPH_CHART_NORMAL_NODE_SIZE_PREVIEW,
          arrowLength = 4,
          arrowWidth = 3

        if (left.plotY < right.plotY) {
          path.push(
            nextLastPoint.plotX - pointRadius * Math.sin(angle),
            nextLastPoint.plotY - pointRadius * Math.cos(angle)
          )
          path.push(
            nextLastPoint.plotX -
              pointRadius * Math.sin(angle) -
              arrowLength * Math.sin(angle) -
              arrowWidth * Math.cos(angle),
            nextLastPoint.plotY -
              pointRadius * Math.cos(angle) -
              arrowLength * Math.cos(angle) +
              arrowWidth * Math.sin(angle)
          )

          path.push(
            nextLastPoint.plotX - pointRadius * Math.sin(angle),
            nextLastPoint.plotY - pointRadius * Math.cos(angle)
          )
          path.push(
            nextLastPoint.plotX -
              pointRadius * Math.sin(angle) -
              arrowLength * Math.sin(angle) +
              arrowWidth * Math.cos(angle),
            nextLastPoint.plotY -
              pointRadius * Math.cos(angle) -
              arrowLength * Math.cos(angle) -
              arrowWidth * Math.sin(angle)
          )
        } else {
          path.push(
            nextLastPoint.plotX + pointRadius * Math.sin(angle),
            nextLastPoint.plotY + pointRadius * Math.cos(angle)
          )
          path.push(
            nextLastPoint.plotX +
              pointRadius * Math.sin(angle) +
              arrowLength * Math.sin(angle) -
              arrowWidth * Math.cos(angle),
            nextLastPoint.plotY +
              pointRadius * Math.cos(angle) +
              arrowLength * Math.cos(angle) +
              arrowWidth * Math.sin(angle)
          )
          path.push(
            nextLastPoint.plotX + pointRadius * Math.sin(angle),
            nextLastPoint.plotY + pointRadius * Math.cos(angle)
          )
          path.push(
            nextLastPoint.plotX +
              pointRadius * Math.sin(angle) +
              arrowLength * Math.sin(angle) +
              arrowWidth * Math.cos(angle),
            nextLastPoint.plotY +
              pointRadius * Math.cos(angle) +
              arrowLength * Math.cos(angle) -
              arrowWidth * Math.sin(angle)
          )
        }

        return path
      }

      return [
        ['M', left.plotX || 0, left.plotY || 0],
        ['L', right.plotX || 0, right.plotY || 0]
      ]
    }
  )
}

export const TestsCallgraph = React.memo(TestsCallgraphComponent)
