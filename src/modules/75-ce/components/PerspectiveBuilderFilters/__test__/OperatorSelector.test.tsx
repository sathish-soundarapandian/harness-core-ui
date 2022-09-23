/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, getByText, fireEvent, waitFor } from '@testing-library/react'
import { QlceViewFilterOperator } from 'services/ce/services'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import OperatorSelector from '../views/OperatorSelector'

describe('Test Cases for Perspective Builder Operator Selector', () => {
  test('Should be able to render Operator Selector Component', async () => {
    const onOperatorChange = jest.fn()

    const { container } = render(
      <TestWrapper>
        <OperatorSelector operator={QlceViewFilterOperator.In} isDisabled={false} onOperatorChange={onOperatorChange} />
      </TestWrapper>
    )

    expect(getByText(container, 'IN')).toBeInTheDocument()
    fireEvent.click(getByText(container, 'IN'))

    const popover = findPopoverContainer() as HTMLElement
    await waitFor(() => popover)

    fireEvent.click(getByText(popover, 'NOT_IN'))
    expect(onOperatorChange).toHaveBeenCalledWith(QlceViewFilterOperator.NotIn)
  })
})
