/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen } from '@testing-library/react'
import { DependencyGraph } from '@cv/components/DependencyGraph/DependencyGraph'
import {
  nodes,
  graphData,
  formattedNodes,
  defaultOptions,
  mockedDependenciesResults,
  mockedServiceDependencies,
  mockedDependenciesWithNoEdgesData,
  mockedDependenciesWithEdgesData,
  mockedNodeWithInfraType,
  mockedNodeWithApplicationType
} from '@cv/components/DependencyGraph/tests/DependencyGraph.mock'
import type * as cvService from 'services/cv'
import {
  formatNodes,
  dependencyGraphOptions,
  getDependencyData,
  getEdgesData,
  getIconForServiceNode,
  getIconDetails
} from '@cv/components/DependencyGraph/DependencyGraph.utils'
import { RiskValues } from '@cv/utils/CommonUtils'
import type { ServiceSummaryDetails } from 'services/cv'
import type { DependencyData } from '../DependencyGraph.types'
import {
  infrastructureIconDetails,
  infrastructureIcon,
  serviceIcon,
  serviceIconDetails
} from '../DependencyGraph.constants'

describe('Unit tests for DependencyGraph', () => {
  test('Ensure Graph Component renders', async () => {
    const { container } = render(<DependencyGraph dependencyData={{ data: graphData, nodes }} />)
    await waitFor(() => expect(container.querySelector('[class*="DependencyGraph"]')).not.toBeNull())
  })

  test.each(nodes)('Ensure %o node has been rendered', async ({ name }) => {
    render(<DependencyGraph dependencyData={{ data: graphData, nodes }} />)
    await waitFor(() => expect(screen.findAllByText(name!)).not.toBeNull())
  })

  test('Ensure the correct number of LOW nodes have been rendered', () => {
    const { container } = render(<DependencyGraph dependencyData={{ data: graphData, nodes }} />)
    const LOWNodes = nodes.filter(node => node.status === RiskValues.HEALTHY)
    expect(container.getElementsByClassName(`Status_${RiskValues.HEALTHY}`).length).toBe(LOWNodes.length)
  })

  test('Ensure the correct number of MEDIUM nodes have been rendered', () => {
    const { container } = render(<DependencyGraph dependencyData={{ data: graphData, nodes }} />)
    const LOWNodes = nodes.filter(node => node.status === RiskValues.NEED_ATTENTION)
    expect(container.getElementsByClassName(`Status_${RiskValues.NEED_ATTENTION}`).length).toBe(LOWNodes.length)
  })

  test('Ensure the correct number of TBD nodes have been rendered', () => {
    const { container } = render(<DependencyGraph dependencyData={{ data: graphData, nodes }} />)
    const LOWNodes = nodes.filter(node => node.status === RiskValues.OBSERVE)
    expect(container.getElementsByClassName(`Status_${RiskValues.OBSERVE}`).length).toBe(LOWNodes.length)
  })

  test('Ensure the correct number of red nodes have been rendered', () => {
    const { container } = render(<DependencyGraph dependencyData={{ data: graphData, nodes }} />)
    const LOWNodes = nodes.filter(node => node.status === RiskValues.UNHEALTHY)
    expect(container.getElementsByClassName(`Status_${RiskValues.UNHEALTHY}`).length).toBe(LOWNodes.length)
  })

  test('Ensure the formatNodes function returns correctly formatted nodes', () => {
    const actualFormattedNodes = formatNodes(nodes, graphData)
    const actualFormattedNodesWithIdsAndClassname = actualFormattedNodes.map(node => ({
      id: node.id,
      className: node.className
    }))
    expect(actualFormattedNodesWithIdsAndClassname).toEqual(formattedNodes)
  })

  test('verify if getDependencyData gives correct results', () => {
    expect(getDependencyData(mockedServiceDependencies as cvService.RestResponseServiceDependencyGraphDTO)).toEqual(
      mockedDependenciesResults
    )
  })

  test('Verify if getEdgesData gives correct default edgesData when there is no edges data coming from the api', () => {
    expect(getEdgesData(mockedDependenciesWithNoEdgesData as DependencyData)).toEqual([
      {
        from: 'Service_2_Environment2',
        to: 'Service_2_Environment2'
      }
    ])
  })

  test('Verify if getEdgesData gives correct edgesData when there is edges data coming from the api', () => {
    expect(getEdgesData(mockedDependenciesWithEdgesData as DependencyData)).toEqual([
      {
        from: 'Service_1_Environment_1',
        to: 'Service_2_Environment_1'
      }
    ])
  })

  test('Verify if getIconForServiceNode gives correct icon when monitored service type is Infrastructure', () => {
    expect(getIconForServiceNode(mockedNodeWithInfraType as ServiceSummaryDetails)).toEqual(infrastructureIcon)
  })

  test('Verify if getIconForServiceNode gives correct icon when monitored service type is Application', () => {
    expect(getIconForServiceNode(mockedNodeWithApplicationType as ServiceSummaryDetails)).toEqual(serviceIcon)
  })

  test('Verify if getCoordinates gives correct coordinates when monitored service type is Application', () => {
    expect(getIconDetails(serviceIcon)).toEqual(serviceIconDetails)
  })

  test('Verify if getCoordinates gives correct coordinates when monitored service type is Infrastructure', () => {
    expect(getIconDetails(infrastructureIcon)).toEqual(infrastructureIconDetails)
  })

  test('Ensure default options data returns correctly', () => {
    expect(JSON.stringify((dependencyGraphOptions({ data: graphData, nodes })?.series?.[0] as any)?.data)).toEqual(
      JSON.stringify(defaultOptions.series[0].data)
    )
  })
})
