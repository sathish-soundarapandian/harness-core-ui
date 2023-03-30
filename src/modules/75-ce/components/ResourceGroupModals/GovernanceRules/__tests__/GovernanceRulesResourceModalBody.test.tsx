/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { SortMethod } from '@common/utils/sortUtils'
import { useGetPolicies } from 'services/ce'

import GovernanceRulesResourceModalBody from '../GovernanceRulesResourceModalBody'
import RulesResponse from './Mock.json'

const props = {
  searchTerm: '',
  sortMethod: SortMethod.Newest,
  onSelectChange: jest.fn(),
  selectedData: [],
  resourceScope: {
    accountIdentifier: ''
  }
}

jest.mock('services/ce', () => ({
  useGetPolicies: jest.fn().mockImplementation(() => ({
    mutate: async () => RulesResponse
  }))
}))

describe('Test Cases for GovernanceRulesResourceModalBody', () => {
  test('Should be able to render Rules', async () => {
    render(
      <TestWrapper>
        <GovernanceRulesResourceModalBody {...props} />
      </TestWrapper>
    )

    expect(await screen.findByText('unused-eip-list')).toBeInTheDocument()
  })

  test('Should be able to render Empty State', async () => {
    const useGetPoliciesMock = useGetPolicies as jest.MockedFunction<any>
    const mutateAction = jest.fn().mockResolvedValue({
      data: {
        rule: []
      }
    })

    useGetPoliciesMock.mockReturnValue({
      mutate: mutateAction
    })

    render(
      <TestWrapper>
        <GovernanceRulesResourceModalBody {...props} />
      </TestWrapper>
    )

    expect(screen.getByText('noData')).toBeInTheDocument()
  })
})
