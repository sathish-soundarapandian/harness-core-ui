/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DEFAULT_TIME_RANGE } from '@common/utils/momentUtils'
import { ModuleName } from 'framework/types/ModuleName'
import ModuleOverviewGrid from '../ModuleOverviewGrid'

jest.mock('../../ModuleOverview', () => {
  return (props: any) => {
    return (
      <div>
        moduleOverview
        <button
          data-testid="moduleOverviewButton"
          onClick={() => {
            props.onClick(ModuleName.CD)
          }}
        >
          moduleOverviewButton
        </button>
        <div data-testid={`isExpanded-${props.module}`}>{props.isExpanded.toString()}</div>
      </div>
    )
  }
})

describe('module overview grid test', () => {
  test('render', () => {
    const { queryAllByText } = render(
      <TestWrapper>
        <ModuleOverviewGrid timeRange={DEFAULT_TIME_RANGE} />
      </TestWrapper>
    )
    expect(queryAllByText('moduleOverview').length).toEqual(7)
  })

  test('on module click', () => {
    const { container } = render(
      <TestWrapper>
        <ModuleOverviewGrid timeRange={DEFAULT_TIME_RANGE} />
      </TestWrapper>
    )
    const moduleOverview = container.querySelector('[data-testid="moduleOverviewButton"]')
    fireEvent.click(moduleOverview!)
    waitFor(() => expect(container.querySelector('[data-testid="isExpanded-CD"]')).toContain('true'))
    expect(container.querySelector('[data-testid="isExpanded-CD"]')?.textContent).toEqual('true')
  })
})
