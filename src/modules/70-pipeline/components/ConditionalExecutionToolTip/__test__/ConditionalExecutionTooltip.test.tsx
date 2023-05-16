/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import type {
  ConditionalExecutionToolTipWrapperProps
} from '../ConditionalExecutionTooltipWrapper';
import ConditionalExecutionTooltipWrapper from '../ConditionalExecutionTooltipWrapper'

const getProps = (): ConditionalExecutionToolTipWrapperProps => ({
  mode: Modes.STAGE,
  data: {
    whenCondition: '<+OnPipelineSuccess> && (some JEXL condition)',
    expressions: [
      {
        expression: 'some expression',
        expressionValue: 'some value'
      }
    ]
  }
})

describe('ConditionalExecutionToolTip', () => {
  test('matches snapshot', () => {
    const props = getProps()
    const { container } = render(
      <TestWrapper>
        <ConditionalExecutionTooltipWrapper {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
