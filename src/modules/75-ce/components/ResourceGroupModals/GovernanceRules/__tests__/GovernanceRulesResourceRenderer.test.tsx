/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { ResourceType } from '@rbac/interfaces/ResourceType'

import PerspectiveResourceRenderer from '../GovernanceRulesResourceRenderer'
import RulesResponse from './Mock.json'

const resourceScope = {
  accountIdentifier: 'accountId'
}

const props = {
  identifiers: ['MockRuleId'],
  resourceScope: resourceScope,
  resourceType: ResourceType.CCM_CLOUD_ASSET_GOVERNANCE_RULE,
  onResourceSelectionChange: jest.fn()
}

jest.mock('services/ce', () => ({
  useGetPolicies: jest.fn().mockImplementation(() => ({
    mutate: async () => RulesResponse
  }))
}))

describe('Test Cases for GovernanceRulesResourceRenderer', () => {
  test('Should be able to render Resource Table', async () => {
    render(
      <TestWrapper>
        <PerspectiveResourceRenderer {...props} />
      </TestWrapper>
    )

    expect(await screen.findByText('unused-eip-list')).toBeInTheDocument()
  })
})
