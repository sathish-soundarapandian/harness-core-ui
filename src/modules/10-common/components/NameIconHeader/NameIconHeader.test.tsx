/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import NameIconHeader from './NameIconHeader'

describe('NameIconHeader test', () => {
  test('render component', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <NameIconHeader iconProps={{ name: 'cd-solid' }} name="stage_name" />
      </TestWrapper>
    )
    expect(container.querySelector('span[data-icon="cd-main"]')).toBeDefined()
    expect(getByText('stage_name')).toBeInTheDocument()
  })
})
