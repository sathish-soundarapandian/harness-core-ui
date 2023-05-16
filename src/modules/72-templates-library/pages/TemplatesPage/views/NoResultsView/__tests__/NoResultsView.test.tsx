/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { waitFor } from '@testing-library/dom'
import { TestWrapper } from '@common/utils/testUtils'
import type { NoResultsViewProps } from '../NoResultsView';
import NoResultsView from '../NoResultsView'

const baseProps: NoResultsViewProps = {
  text: 'There are no templates in your project.',
  onReset: jest.fn()
}

describe('<NoResultsView> tests', () => {
  test('should match snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <NoResultsView {...baseProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should match snapshot in minimal mode', () => {
    const { container } = render(
      <TestWrapper>
        <NoResultsView {...baseProps} minimal={true} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should match snapshot when has search params', async () => {
    const { container, getByRole } = render(
      <TestWrapper>
        <NoResultsView {...baseProps} hasSearchParam={true} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const restButton = getByRole('button', { name: /common.filters.clearFilters/ })
    fireEvent.click(restButton)
    await waitFor(() => expect(baseProps.onReset).toBeCalled())
  })
})
