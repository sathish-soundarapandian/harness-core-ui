/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ValidationPopoverContent } from '../ValidationPopoverContent'

describe('<ValidationPopoverContent />', () => {
  test('should not render anything if status is falsy', () => {
    const { container } = render(<ValidationPopoverContent status={undefined} />)

    expect(container).toBeEmptyDOMElement()
  })

  test('should not render anything if status is IN_PROGRESS', () => {
    const { container } = render(<ValidationPopoverContent status={'IN_PROGRESS'} />)

    expect(container).toBeEmptyDOMElement()
  })

  test('errorCount should default to 1 if it is falsy', () => {
    render(
      <TestWrapper getString={(key, vars) => `${key} ${Object.values(vars ?? {})?.join()}`}>
        <ValidationPopoverContent status={'ERROR'} />
      </TestWrapper>
    )

    expect(screen.getByText(`pipeline.validation.nIssuesFound 1`)).toBeInTheDocument()
  })
})
