/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act } from '@testing-library/react'

import { MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import type { StepFormikRef } from '@pipeline/components/AbstractSteps/Step'

import { AdvancedStepsWithRef } from '../AdvancedSteps'

jest.mock('@common/components/MonacoEditor/MonacoEditor')

const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  })
}))

describe('<AdvancedSteps /> tests', () => {
  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <AdvancedStepsWithRef
          helpPanelVisible
          isStepGroup={false}
          isReadonly={false}
          step={{} as any}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          stepsFactory={{ getStep: jest.fn(() => ({ hasDelegateSelectionVisible: true })) } as any}
          onUpdate={jest.fn()}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  // this test can be removed if we remove obSubmit handler
  test('submit works', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onSubmit = jest.fn()

    render(
      <TestWrapper>
        <AdvancedStepsWithRef
          helpPanelVisible
          isStepGroup={false}
          step={{} as any}
          isReadonly={false}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          stepsFactory={{ getStep: jest.fn() } as any}
          ref={ref}
          onUpdate={onSubmit}
        />
      </TestWrapper>
    )

    await act(() => ref.current?.submitForm()!)

    expect(onSubmit).toHaveBeenCalledWith({
      delegateSelectors: [],
      failureStrategies: [],
      when: undefined,
      tab: 'ADVANCED'
    })
  })
})
