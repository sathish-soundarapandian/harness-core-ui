/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { ConditionalExecutionProps } from '../ConditionalExecution';
import ConditionalExecution from '../ConditionalExecution'

const getProps = (hasData: boolean): ConditionalExecutionProps => ({
  onUpdate: jest.fn(),
  isReadonly: false,
  selectedStage: {
    stage: {
      ...(hasData && {
        when: {
          pipelineStatus: 'Success',
          condition: 'some condition'
        }
      })
    } as any
  }
})

jest.mock('@common/components/MonacoEditor/MonacoEditor')

describe('ConditionalExecution', () => {
  test('matches snapshot when no data', () => {
    const props = getProps(false)
    const { container } = render(
      <TestWrapper>
        <ConditionalExecution {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})

describe('ConditionalExecution', () => {
  test('matches snapshot with data', () => {
    const props = getProps(true)
    const { container } = render(
      <TestWrapper>
        <ConditionalExecution {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
