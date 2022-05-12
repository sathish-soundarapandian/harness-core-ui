/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import { QlceViewFilterOperator } from 'services/ce/services'
import { TestWrapper } from '@common/utils/testUtils'
import ValueSelector from '../views/ValueSelector'
import ResponseData from './ResponseData.json'

const props = {
  setValues: jest.fn(),
  setOperator: jest.fn(),
  operator: QlceViewFilterOperator.In,
  values: {},
  service: {
    id: 'region',
    name: 'Region'
  },
  provider: {
    id: 'COMMON',
    name: 'Common'
  },
  isLabelOrTag: false,
  setService: jest.fn(),
  timeRange: {
    to: '2021-08-09',
    from: '2021-08-04'
  }
}

describe('test cases for value Selector component', () => {
  test('should be able to render the component', () => {
    const responseState = {
      executeQuery: () => {
        return fromValue(ResponseData)
      }
    }
    const { container } = render(
      <TestWrapper>
        <Provider value={responseState as any}>
          <ValueSelector {...props} />
        </Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Should be able to switch to like operator', () => {
    const responseState = {
      executeQuery: () => {
        return fromValue(ResponseData)
      }
    }
    const { container, getByText } = render(
      <TestWrapper>
        <Provider value={responseState as any}>
          <ValueSelector {...props} />
        </Provider>
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('ce.perspectives.createPerspective.operatorLabels.opLike'))
    })

    expect(container.querySelector('.bp3-input')).toBeDefined()
  })
})
