/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import {
  BuildsNavItem,
  ChaosNavItem,
  CloudCostsNavItem,
  DeploymentsNavItem,
  FeatureFlagsNavItem,
  SCMNavItem,
  SRMNavItem,
  STONavItem
} from '../ModuleLinks'

describe('module links test', () => {
  test('render Build nav item', () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toConnectorDetails({ accountId: 'testId' })}>
        <BuildsNavItem />
      </TestWrapper>
    )
    expect(getByText('buildsText')).toBeDefined()
    expect(container.querySelector('[data-icon="ci-main"]')).toBeDefined()
  })

  test('render ChaosNavItem', () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toConnectorDetails({ accountId: 'testId' })}>
        <ChaosNavItem />
      </TestWrapper>
    )
    expect(getByText('common.chaosText')).toBeDefined()
    expect(container.querySelector('[data-icon="chaos-main"]')).toBeDefined()
  })

  test('render CloudCostsNavItem', () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toConnectorDetails({ accountId: 'testId' })}>
        <CloudCostsNavItem />
      </TestWrapper>
    )
    expect(getByText('cloudCostsText')).toBeDefined()
    expect(container.querySelector('[data-icon="ce-main"]')).toBeDefined()
  })

  test('render DeploymentsNavItem', () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toConnectorDetails({ accountId: 'testId' })}>
        <DeploymentsNavItem />
      </TestWrapper>
    )
    expect(getByText('deploymentsText')).toBeDefined()
    expect(container.querySelector('[data-icon="cd-main"]')).toBeDefined()
  })

  test('render FeatureFlagsNavItem', () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toConnectorDetails({ accountId: 'testId' })}>
        <FeatureFlagsNavItem />
      </TestWrapper>
    )
    expect(getByText('featureFlagsText')).toBeDefined()
    expect(container.querySelector('[data-icon="cf-main"]')).toBeDefined()
  })

  test('render SCMNavItem', () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toConnectorDetails({ accountId: 'testId' })}>
        <SCMNavItem />
      </TestWrapper>
    )
    expect(getByText('common.purpose.scm.name')).toBeDefined()
    expect(container.querySelector('[data-icon="gitops-green"]')).toBeDefined()
  })

  test('render SRMNavItem', () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toConnectorDetails({ accountId: 'testId' })}>
        <SRMNavItem />
      </TestWrapper>
    )
    expect(getByText('common.purpose.cv.serviceReliability')).toBeDefined()
    expect(container.querySelector('[data-icon="cv-main"]')).toBeDefined()
  })

  test('render STONavItem', () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toConnectorDetails({ accountId: 'testId' })}>
        <STONavItem />
      </TestWrapper>
    )
    expect(getByText('common.purpose.sto.continuous')).toBeDefined()
    expect(container.querySelector('[data-icon="sto-color-filled"]')).toBeDefined()
  })
})
