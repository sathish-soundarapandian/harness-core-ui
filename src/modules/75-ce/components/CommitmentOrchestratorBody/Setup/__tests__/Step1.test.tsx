/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import Step1 from '../Step1'
// import * as context from '../SetupContext'

jest.mock('../SetupContext', () => ({
  useSetupContext: () => ({
    setupData: {
      overallCoverage: 80
    },
    setSetupData: jest.fn()
  })
}))

describe('Setup Step 1', () => {
  test('should set range to recommended value', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Step1 />
      </TestWrapper>
    )

    expect((container.querySelector('input[type="range"]') as HTMLInputElement).value).toBe('80')
    fireEvent.click(getByText('ce.commitmentOrchestration.setup.step1.resetLabel'))
    expect((container.querySelector('input[type="range"]') as HTMLInputElement).value).toBe('70')
  })
})
