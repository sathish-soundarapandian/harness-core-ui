/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, getByText, waitFor } from '@testing-library/react'
import { QlceViewFilterOperator } from 'services/ce/services'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import ValuesSelectors from '../views/ValuesSelector'

const mockData = {
  provider: {
    id: 'CLUSTER',
    name: ''
  },
  service: {
    id: 'clusterName',
    name: 'Cluster Name'
  },
  isDisabled: false,
  operator: QlceViewFilterOperator.In,
  valueList: [
    'gke',
    'ce-dev-new',
    'sample-ce-dev',
    'renanme_test_first_renamed',
    'test-utsav-4th-june',
    'ce-ecs-ec2-test',
    'rename_cluster_2_renamed',
    'eks-fargate-cluster',
    'TestDeletePt',
    'auto_cp_v8ttxr',
    'test-utsav-9th-jun',
    'qa-target-clone-2',
    'ce-dev-ce-delegate-aks',
    'Kubernetes ce-dev-1',
    'auto_cp_fytumb',
    'ce-dev-eks-fargate',
    'ce-dev-aks-manual',
    'aks-cluster',
    'qa-target-clone-4',
    'pr-target',
    'Utsav EKS Fargate',
    'ce-test-dontdelete',
    'qa_target_clone_22',
    'azure-harness-qa',
    'TestDeletePt2',
    'qa-target-clone-5-rename',
    'ce-dev cluster',
    'auto_cp_yoplhk',
    'qa-target-v114',
    'gke-automation',
    'Kubernetes ce-dev',
    'qa-target-clone',
    'gke-new',
    'qa_target_clone_21',
    'eks-fargate'
  ],
  searchText: '',
  fetching: false,
  selectedVal: ['gke'],
  onValueChange: jest.fn(),
  onInputChange: jest.fn()
}

describe('Test Cases for Perspective Builder Values Selector', () => {
  test('Should be able to render Values Selector Component', async () => {
    const { container } = render(
      <TestWrapper>
        <ValuesSelectors {...mockData} />
      </TestWrapper>
    )

    expect(container.querySelector('[class*="bp3-input-ghost"]')).toBeInTheDocument()
    expect(getByText(container, 'gke')).toBeDefined()

    const tagInput = container.querySelector('input') as HTMLElement
    fireEvent.click(tagInput)

    const popover = findPopoverContainer() as HTMLElement
    expect(getByText(popover, 'ce.perspectives.createPerspective.filters.selectAll')).toBeDefined()
  })

  test('Should be able to add new Value', async () => {
    const { container } = render(
      <TestWrapper>
        <ValuesSelectors {...mockData} />
      </TestWrapper>
    )

    const input = container.querySelector('[class*="bp3-input-ghost"]') as HTMLElement

    fireEvent.change(input, { target: { value: 'mock_val' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 13 })

    waitFor(() => {
      expect(getByText(container, 'mock_val')).toBeInTheDocument()
      expect(mockData.onValueChange).toHaveBeenCalledWith(['gke', 'mock_val'])
    })
  })

  test('Should be able to remove Value Tag', async () => {
    const { container } = render(
      <TestWrapper>
        <ValuesSelectors {...mockData} />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('.bp3-tag-remove')!)
    waitFor(() => expect(mockData.onValueChange).toHaveBeenCalledWith([]))
  })

  test('Should be able to render Text Input for LIKE Operator', async () => {
    const { container } = render(
      <TestWrapper>
        <ValuesSelectors {...mockData} operator={QlceViewFilterOperator.Like} />
      </TestWrapper>
    )

    const textInput = container.querySelector('.bp3-input')
    fireEvent.change(textInput!, { target: { value: 'mock_value' } })

    waitFor(() => expect(mockData.onValueChange).toHaveBeenCalledWith(['mock_value']))
  })
})
