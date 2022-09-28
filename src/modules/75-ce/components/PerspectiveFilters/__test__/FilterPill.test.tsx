/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import { act } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import type { QlceViewFilterInput } from 'services/ce/services'
import ResponseData from './ResponseData.json'
import FilterPill from '../FilterPill'

const props = {
  id: 0,
  removePill: jest.fn(),
  onChange: jest.fn(),
  pillData: {
    field: {
      fieldId: 'clusterName',
      fieldName: 'Cluster Name',
      identifier: 'CLUSTER',
      identifierName: 'Cluster'
    },
    operator: 'IN',
    values: ['aditya cloud']
  } as QlceViewFilterInput,
  fieldValuesList: [],
  timeRange: {
    to: '2021-08-09',
    from: '2021-08-04'
  }
}

describe('test cases for Filter Pill component', () => {
  test('should be able to render the component', () => {
    const responseState = {
      executeQuery: () => {
        return fromValue(ResponseData)
      }
    }
    const { container } = render(
      <TestWrapper>
        <Provider value={responseState as any}>
          <FilterPill {...props} />
        </Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Should remove the pill on click of cross icon', () => {
    const responseState = {
      executeQuery: () => {
        return fromValue(ResponseData)
      }
    }
    const { container } = render(
      <TestWrapper>
        <Provider value={responseState as any}>
          <FilterPill {...props} />
        </Provider>
      </TestWrapper>
    )

    const crossBtn = container.querySelector('[data-testid="removeFilterPill"]')
    expect(crossBtn).toBeDefined()

    act(() => {
      fireEvent.click(crossBtn!)
    })

    expect(props.removePill).toBeCalled()
  })
})
