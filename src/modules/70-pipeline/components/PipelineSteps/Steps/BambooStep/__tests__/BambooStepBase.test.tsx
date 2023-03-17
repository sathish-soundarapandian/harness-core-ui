/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, findByText, fireEvent, render } from '@testing-library/react'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { factory, TestStepWidget } from '../../__tests__/StepTestUtil'
import {
  getBambooStepEditModePropsWithConnectorId,
  getBambooStepRunTimeProps,
  mockConnectorResponse,
  mockPlansResponse
} from './BambooStepTestHelper'
import { BambooStep } from '../BambooStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useGetConnector: () => mockConnectorResponse,
  useGetPlansKey: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ...mockPlansResponse
      })
    }),
    refetch: jest.fn(),
    error: null
  }))
}))

describe('Bamboo Step Tests', () => {
  beforeEach(() => {
    factory.registerStep(new BambooStep())
  })
  test('should fetch plans - api call should be successful', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getBambooStepEditModePropsWithConnectorId()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.BambooBuild}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    const planDropdwnBn = container.querySelectorAll('[data-icon="chevron-down"]')[1]
    fireEvent.click(planDropdwnBn!)
    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const selectItem = await findByText(selectListMenu as HTMLElement, 'PFP-PT')

    act(() => {
      fireEvent.click(selectItem)
    })
    expect(container.querySelector('input[name="spec.planName"]')).toHaveValue('PFP-PT')
  })

  test('should render form when fields are runtime', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getBambooStepRunTimeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.BambooBuild}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
