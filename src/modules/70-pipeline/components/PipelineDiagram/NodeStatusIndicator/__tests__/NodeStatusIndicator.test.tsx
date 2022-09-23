/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { NodeStatusIndicator } from '../NodeStatusIndicator'

describe('Node Status Indicator Test', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  test('Should render diagramnodes', () => {
    const { container } = render(
      <TestWrapper>
        <NodeStatusIndicator nodeState={[{ status: 'Success' }, { status: 'Failed' }, { status: 'Running' } as any]} />
      </TestWrapper>
    )
    const successStatusLabel = container.querySelector(`[data-icon="success-tick"]`)
    const failedStatusLabel = container.querySelector(`[data-icon="failed"]`)
    const runninngStatusLabel = container.querySelector(`[data-icon="running"]`)
    expect(successStatusLabel).toBeDefined()
    expect(failedStatusLabel).toBeDefined()
    expect(runninngStatusLabel).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
