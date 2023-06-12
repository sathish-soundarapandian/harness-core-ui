/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import HarnessCopilot from '../HarnessCopilot'

describe('Test HarnessCopilot component', () => {
  test('initial render', () => {
    const { getByText } = render(
      <TestWrapper>
        <HarnessCopilot mode="console-view" />
      </TestWrapper>
    )
    expect(getByText('pipeline.copilot.askAICopilot')).toBeInTheDocument()

    //tooltip and it's content is visible
    expect(getByText('pipeline.copilot.introduction')).toBeInTheDocument()
    expect(getByText('pipeline.copilot.helpText')).toBeInTheDocument()
  })
})
