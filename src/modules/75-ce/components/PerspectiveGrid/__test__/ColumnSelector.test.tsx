/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DEFAULT_GROUP_BY } from '@ce/utils/perspectiveUtils'
import ColumnSelector from '../ColumnSelector'
import { DEFAULT_COLS } from '../Columns'

const mock = {
  columns: DEFAULT_COLS,
  selectedColumns: DEFAULT_COLS,
  onChange: jest.fn().mockImplementationOnce(() => ({})),
  groupBy: DEFAULT_GROUP_BY
}

describe('test cases for ColumnSelector component', () => {
  test('should be able to render the column selector and its dropdown', async () => {
    const { container, getByText, getByTestId } = render(
      <TestWrapper>
        <ColumnSelector {...mock} />
      </TestWrapper>
    )

    expect(getByText('ce.gridColumnSelector')).toBeDefined()

    fireEvent.click(getByText('ce.gridColumnSelector'))
    await waitFor(() => {
      expect(getByText('Name')).not.toBeNull()
      expect(getByText('Total cost')).not.toBeNull()
      expect(getByText('Cost trend')).not.toBeNull()

      const nameCheckBox = getByTestId('checkbox-name') as HTMLInputElement
      expect(nameCheckBox).not.toBeNull()
      expect(nameCheckBox.disabled).toBe(true)
      expect(nameCheckBox.checked).toBe(true)
    })

    expect(container).toMatchSnapshot()
  })
})
