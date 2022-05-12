/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CheckboxCell, { CheckboxCellProps } from '../CheckboxCell'

const renderComponent = (props: Partial<CheckboxCellProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <CheckboxCell row={{ original: { name: 'Test', identifier: 'test' } }} {...props} />
    </TestWrapper>
  )

describe('CheckboxCell', () => {
  test('it should display a checkbox', async () => {
    const identifier = 'TEST-IDENTIFIER'
    renderComponent({ row: { original: { name: 'Test', identifier } } })

    const input = screen.getByRole('checkbox', { name: 'cf.targetDetail.addTargetToTargetGroup' })
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('name', `targetGroups.${identifier}`)
  })
})
