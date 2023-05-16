/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import type { ErrorHandlerProps } from '@common/components/ErrorHandler/ErrorHandler';
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import { TestWrapper } from '@common/utils/testUtils'
import mockError from '@common/components/ErrorHandler/__tests__/ErrorHandler.json'

describe('<ErrorHandler /> tests', () => {
  test('should render ErrorHandler component', async () => {
    const { container } = render(
      <TestWrapper>
        <ErrorHandler responseMessages={mockError as unknown as ErrorHandlerProps['responseMessages']} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
