/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ModuleColumnChart from '../ModuleColumnChart/ModuleColumnChart'

jest.mock('highcharts-react-official', () => {
  return () => <div>High charts</div>
})

describe('module overview grid test', () => {
  test('render with emoty data', () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <ModuleColumnChart isExpanded={false} count={'10'} data={[]} />
      </TestWrapper>
    )

    const countRow = container.querySelector('[class*="countRow"]')

    expect(countRow?.textContent).toEqual('10')
    expect(queryByText('High charts')).not.toBeNull()
  })

  test('with count change info', () => {
    const { container } = render(
      <TestWrapper>
        <ModuleColumnChart
          isExpanded={false}
          count={'10'}
          data={[]}
          countChangeInfo={{ countChange: 19, countChangeRate: 10 }}
        />
      </TestWrapper>
    )

    const countRow = container.querySelector('[class*="countRow"]')

    expect(countRow?.textContent).toEqual('10symbol-triangle-up19')
  })

  test('with negative count change info', () => {
    const { container } = render(
      <TestWrapper>
        <ModuleColumnChart
          isExpanded={false}
          count={'10'}
          data={[]}
          countChangeInfo={{ countChange: -19, countChangeRate: 10 }}
        />
      </TestWrapper>
    )

    const countRow = container.querySelector('[class*="countRow"]')

    expect(countRow?.textContent).toEqual('10symbol-triangle-down-19')
  })

  test('without count change', () => {
    const { queryByText } = render(
      <TestWrapper>
        <ModuleColumnChart isExpanded={false} count={'10'} data={[]} countChangeInfo={{ countChangeRate: 10 }} />
      </TestWrapper>
    )

    expect(queryByText('symbol-triangle-up')).toBeNull()
    expect(queryByText('symbol-triangle-down')).toBeNull()
  })
})
