/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, RenderResult, screen } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import IACMResourceStackWizard from '..'

const actions = { onSubmit: jest.fn() }

const renderComponent = (): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/iacm/orgs/:orgIdentifier/projects/:projectIdentifier/stacks"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <IACMResourceStackWizard onSubmit={actions.onSubmit} />
    </TestWrapper>
  )

describe('IACMResourceStackWizard', () => {
  test('it should render correctly', async () => {
    renderComponent()

    expect(screen.getAllByText('iacm.stackWizard.provisionerType')).toHaveLength(2)
    expect(screen.getByText('iacm.createStack')).toBeInTheDocument()
  })
})
