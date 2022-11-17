/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { HarnessIcons, Utils } from '@harness/uicore'
import {
  infrastructureIconDetails,
  infrastructureIcon,
  serviceIcon,
  serviceIconDetails,
  statusColors
} from '@cv/components/DependencyGraph/DependencyGraph.constants'
import type { Node, DependencyData, GraphData, IconDetails } from '@cv/components/DependencyGraph/DependencyGraph.types'
import type { Edge, RestResponseServiceDependencyGraphDTO, ServiceSummaryDetails } from 'services/cv'
import { getRiskColorValue, getSecondaryRiskColorValue, RiskValues } from '@cv/utils/CommonUtils'
import css from './DependencyGraph.module.scss'

function replaceFill(logo: any, primaryColor: string) {
  if (Object.prototype.hasOwnProperty.call(logo, 'props')) {
    if (Object.prototype.hasOwnProperty.call(logo.props, 'fill')) {
      logo = { ...logo, props: { ...logo.props, fill: primaryColor } }
    }
    if (Object.prototype.hasOwnProperty.call(logo.props, 'stroke')) {
      logo = { ...logo, props: { ...logo.props, stroke: primaryColor } }
    }
    if (Object.prototype.hasOwnProperty.call(logo.props, 'width' || 'height' || 'viewBox')) {
      const { width, height, ...logoProps } = logo.props
      logo = { ...logo, props: { ...logoProps, viewBox: '0 0 24 24' } }
    }
    if (Object.prototype.hasOwnProperty.call(logo.props, 'children')) {
      logo = {
        ...logo,
        props: {
          ...logo.props,
          children:
            logo.props.children.length > 1
              ? Array.from(logo.props.children).map((child: any) => {
                  return replaceFill(child, primaryColor)
                })
              : replaceFill(logo.props.children, primaryColor)
        }
      }
    }
  }
  return logo
}

export const getIconDetails = (icon: string): IconDetails => {
  if (icon === infrastructureIcon) {
    return infrastructureIconDetails
  }

  return serviceIconDetails
}

export function formatNodes(nodes?: Node[], data?: Edge[]) {
  if (!nodes) {
    return []
  }
  function getColorCode(color: string) {
    return color.substring(4, color.length - 1)
  }

  function hexSvg(status: ServiceSummaryDetails['riskLevel'], icon: string) {
    const selectedColor = statusColors.filter(colors => {
      return colors.status === status
    })?.[0] || {
      primary: getRiskColorValue(RiskValues.NO_DATA, false),
      secondary: getSecondaryRiskColorValue(RiskValues.NO_DATA, false)
    }

    const styles = getComputedStyle(document.body)
    const primaryColor = styles.getPropertyValue(getColorCode(Utils.getRealCSSColor(selectedColor?.primary)))
    const secondaryColor = styles.getPropertyValue(getColorCode(Utils.getRealCSSColor(selectedColor?.secondary)))

    const LogoFactory = HarnessIcons[icon]
    // eslint-disable-next-line
    // @ts-ignore
    const Logo = LogoFactory()

    const ColoredLogo = replaceFill(Logo, primaryColor)

    return (
      <svg width="60" height="69" viewBox="0 0 60 69" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_dd)">
          <path
            d="M29 2.57735C29.6188 2.22009 30.3812 2.22008 31 2.57735L56.7128 17.4226C57.3316 17.7799 57.7128 18.4402
          57.7128 19.1547V48.8453C57.7128 49.5598 57.3316 50.2201 56.7128 50.5774L31 65.4226C30.3812 65.7799 29.6188 65.7799
          29 65.4226L3.28719 50.5774C2.66839 50.2201 2.28719 49.5598 2.28719 48.8453L2.28719 19.1547C2.28719 18.4402 2.66839 17.7799 3.28719 17.4226L29 2.57735Z"
            fill={secondaryColor}
          />
          <path
            d="M29.25 3.01036C29.7141 2.74241 30.2859 2.74241 30.75 3.01036L56.4628 17.8557C56.9269 18.1236 57.2128 18.6188
          57.2128 19.1547V48.8453C57.2128 49.3812 56.9269 49.8764 56.4628 50.1443L30.75 64.9896C30.2859 65.2576 29.7141 65.2576
          29.25 64.9896L3.53719 50.1443C3.07309 49.8764 2.78719 49.3812 2.78719 48.8453L2.78719 19.1547C2.78719 18.6188 3.07309 18.1236 3.53719 17.8557L29.25 3.01036Z"
            stroke={primaryColor}
          />
          <svg {...getIconDetails(icon)} fill={primaryColor} xmlns="http://www.w3.org/2000/svg">
            {ColoredLogo}
          </svg>
        </g>
        <defs>
          <filter
            id="filter0_dd"
            x="0.287109"
            y="0.809448"
            width="59.4256"
            height="67.3812"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="0.5" />
            <feGaussianBlur stdDeviation="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.376471 0 0 0 0 0.380392 0 0 0 0 0.439216 0 0 0 0.16 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="0.5" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.156863 0 0 0 0 0.160784 0 0 0 0 0.239216 0 0 0 0.08 0" />
            <feBlend mode="normal" in2="effect1_dropShadow" result="effect2_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow" result="shape" />
          </filter>
        </defs>
      </svg>
    )
  }

  const edgesWithMissingNode = [
    ...(data?.filter(edge => !nodes.map(node => node?.id).includes(edge.from || '')).map(missing => missing.from) ||
      []),
    ...(data?.filter(edge => !nodes.map(node => node?.id).includes(edge.to || '')).map(missing => missing.to) || [])
  ]

  return [
    ...nodes.map((node: Node) => {
      return {
        id: node.id,
        serviceRef: node.serviceRef,
        environmentRef: node.environmentRef,
        className: `PointData ${node?.name?.replace(' ', '')} Status_${node?.status}`,
        marker: {
          symbol: `url(data:image/svg+xml;utf8,${encodeURIComponent(
            renderToStaticMarkup(hexSvg(node.status, node.icon || serviceIcon))
          )})`
        }
      }
    }),
    ...(edgesWithMissingNode.length > 0
      ? edgesWithMissingNode.map(missing => {
          return {
            id: missing,
            className: `PointData ${missing || ''.replace(' ', '')} Status_NO_ANALYSIS`,
            marker: {
              symbol: `url(data:image/svg+xml;utf8,${encodeURIComponent(
                renderToStaticMarkup(hexSvg(RiskValues.NO_ANALYSIS, serviceIcon))
              )})`
            }
          }
        })
      : [])
  ]
}

export function deselectNodes() {
  Array.from(document.getElementsByClassName('PointData') as HTMLCollectionOf<HTMLElement>).forEach(p => {
    p.style.opacity = '1'
  })
}

export function selectNodes(classNames: string) {
  deselectNodes()
  Array.from(document.getElementsByClassName('PointData') as HTMLCollectionOf<HTMLElement>)
    .filter(p => !classNames.split(' ').every(val => [...p.classList].includes(val)))
    .forEach(p => (p.style.opacity = '0.3'))
}

export const getDependencyData = (
  serviceDependencyGraphData: RestResponseServiceDependencyGraphDTO | null
): DependencyData | null => {
  let dependencyData = null
  if (serviceDependencyGraphData?.resource?.nodes && serviceDependencyGraphData.resource.nodes.length) {
    dependencyData = {
      nodes: serviceDependencyGraphData.resource.nodes.map(node => ({
        id: node.identifierRef,
        serviceRef: node.serviceRef,
        environmentRef: node.environmentRef,
        status: node.riskLevel,
        icon: getIconForServiceNode(node),
        name: node.serviceName
      })),
      data: (serviceDependencyGraphData?.resource?.edges as GraphData[]) || []
    }
  }

  return dependencyData
}

export function getIconForServiceNode(node: ServiceSummaryDetails): string {
  let icon = serviceIcon
  if ((node as any)?.type === 'Infrastructure') {
    icon = infrastructureIcon
  }
  return icon
}

export function getEdgesData(dependencyData: DependencyData): Edge[] {
  return dependencyData?.data && dependencyData?.data?.length
    ? dependencyData?.data
    : [
        {
          ...(dependencyData?.nodes &&
            dependencyData?.nodes?.length && {
              from: dependencyData.nodes[0].id,
              to: dependencyData.nodes[0].id
            })
        }
      ]
}

export function dependencyGraphOptions(dependencyData: DependencyData): Highcharts.Options {
  const edgesData = getEdgesData(dependencyData)
  return {
    chart: {
      type: 'networkgraph',
      backgroundColor: 'transparent',
      events: {
        click: function (): void {
          deselectNodes()
        }
      }
    },
    credits: {
      enabled: false
    },
    title: { text: '' },
    plotOptions: {
      networkgraph: {
        layoutAlgorithm: {
          integration: 'verlet'
        },
        cursor: 'pointer',
        states: { inactive: { enabled: false }, hover: { enabled: false } },
        dataLabels: {
          enabled: true,
          linkFormat: '',
          useHTML: true,
          allowOverlap: false,
          y: 50,
          className: css.serviceName,
          formatter: function (this: any) {
            if (this.key) {
              const filteredNode = dependencyData?.nodes?.filter(node => node?.id === this.key)?.[0]

              const title = filteredNode ? filteredNode.name : this.key
              return renderToStaticMarkup(<span>{title}</span>)
            } else {
              return ''
            }
          }
        }
      }
    },
    tooltip: { enabled: false },
    series: [
      {
        id: 'lang-tree',
        marker: {
          enabled: true,
          radius: 50
        },
        type: 'networkgraph',
        data: edgesData,
        nodes: formatNodes(dependencyData?.nodes, edgesData),
        point: {
          events: {
            click: function (e: any): void {
              selectNodes(e.point.className)
            }
          }
        }
      }
    ]
  }
}
