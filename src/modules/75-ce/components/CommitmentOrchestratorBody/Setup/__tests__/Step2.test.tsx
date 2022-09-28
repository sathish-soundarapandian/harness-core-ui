/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, findByText, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import Step2 from '../Step2'

const setFn = jest.fn()

jest.mock('../SetupContext', () => ({
  useSetupContext: () => ({
    setupData: {
      overallCoverage: 80
    },
    setSetupData: setFn
  })
}))

const mockedInstanceTypes = {
  response: [
    {
      instance_type: 'c5.large',
      region: 'ap-southeast-1',
      compute_spend: 360.923684208,
      coverage_percentage: 0,
      machine_type: 'Linux/UNIX'
    },
    {
      instance_type: 't3.micro',
      region: 'ap-southeast-1',
      compute_spend: 1.1520000000000001,
      coverage_percentage: 100,
      machine_type: 'Linux/UNIX'
    }
  ]
}

const mockedFiltersResponse = {
  response: {
    region: ['ap-south-1', 'us-west-1', 'us-east-1', 'ap-southeast-1', 'eu-west-2', 'ca-central-1', 'us-west-2'],
    instance_family: ['t2', 'm5', 'i3', 'c5', 'c6a', 't3a', 'm4', 't3'],
    account_id: ['357919113896', '868001352780']
  }
}

jest.mock('services/lw-co', () => ({
  useFetchSetupInstanceTypes: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => Promise.resolve(mockedInstanceTypes)),
    loading: false
  })),
  useFetchFilters: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => Promise.resolve(mockedFiltersResponse))
  }))
}))

describe('Setup Step 2', () => {
  test('should filter instance types', async () => {
    const { container } = render(
      <TestWrapper>
        <Step2 />
      </TestWrapper>
    )
    const regionsDropdown = container.querySelector(`input[name="region"]`) as HTMLInputElement
    const regionsCaret = container
      .querySelector(`input[name="region"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    fireEvent.click(regionsCaret!)
    const regionToSelect = await findByText(container.querySelector('.bp3-menu') as HTMLElement, 'ap-southeast-1')
    act(() => {
      fireEvent.click(regionToSelect)
    })
    expect(regionsDropdown.value).toBe('ap-southeast-1')

    const instanceFamilyDropdown = container.querySelector(`input[name="instanceFamily"]`) as HTMLInputElement
    const instanceFamilyCaret = container
      .querySelector(`input[name="instanceFamily"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    fireEvent.click(instanceFamilyCaret!)
    const instanceFamilyToSelect = await findByText(container.querySelector('.bp3-menu') as HTMLElement, 't3')
    act(() => {
      fireEvent.click(instanceFamilyToSelect)
    })
    expect(instanceFamilyDropdown.value).toBe('t3')
  })
})
