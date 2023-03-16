/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable jest/no-commented-out-tests */
import React from 'react'
import { act, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import { SelectDeploymentType, SelectDeploymentTypeRefInstance } from '../SelectDeploymentType'
import { CDOnboardingContext } from '../../CDOnboardingStore'
import { contextValues } from '../../__tests__/mocks'

jest.mock('@common/hooks/useTelemetry', () => ({
  useTelemetry: jest.fn(() => ({
    trackEvent: jest.fn()
  }))
}))
jest.mock('nanoid', () => ({
  customAlphabet: () => {
    const retnFn = (): string => 'bsadfd'
    return retnFn
  }
}))

const PATH = routes.toCDOnboardingWizard({ ...projectPathProps, ...modulePathProps, ...pipelinePathProps })
const PATH_PARAMS = {
  accountId: 'testAccountId',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  pipelineIdentifier: 'Pipeline_1',
  module: 'cd' as Module
}

describe('SelectDeployment Type Onboarding Wizard Step 1', () => {
  test('render the component', async () => {
    const ref = React.createRef<SelectDeploymentTypeRefInstance>()
    const { container, getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <CDOnboardingContext.Provider value={{ ...contextValues }}>
          <SelectDeploymentType
            ref={ref as any}
            disableNextBtn={jest.fn()}
            enableNextBtn={jest.fn()}
            onSuccess={jest.fn()}
          />
        </CDOnboardingContext.Provider>
      </TestWrapper>
    )
    await act(() => (ref?.current as any)?.submitForm()!)
    const k8sCard = container.querySelector('.bp3-card')!
    expect(k8sCard).toBeDefined()
    expect(k8sCard).toHaveClass('Card--selected')
    expect(getByText('cd.getStartedWithCD.selectDeploymentType')).toBeInTheDocument()
  })
})
