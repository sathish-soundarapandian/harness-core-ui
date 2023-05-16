/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, screen } from '@testing-library/react'

import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import type { TargetingRulesTabFooterProps } from '../TargetingRulesTabFooter';
import TabTargetingFooter from '../TargetingRulesTabFooter'

const renderComponent = (props: Partial<TargetingRulesTabFooterProps> = {}): void => {
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <TabTargetingFooter isLoading={false} {...props} handleSubmit={jest.fn()} handleCancel={jest.fn()} />
    </TestWrapper>
  )
}

describe('TargetingRulesTabFooter', () => {
  test('it should show loading spinner button when loading ', async () => {
    renderComponent({ isLoading: true })
    expect(screen.getByTestId('save-loading-button')).toBeInTheDocument()
  })
})
