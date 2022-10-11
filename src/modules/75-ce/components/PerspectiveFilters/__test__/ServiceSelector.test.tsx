/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import type { QlceViewFieldIdentifierData } from 'services/ce/services'

import ServiceSelector from '../views/ServiceSelector'

const props = {
  fieldValueList: [
    {
      identifier: 'COMMON',
      identifierName: 'Common',
      values: [
        {
          fieldId: 'product',
          fieldName: 'Product',
          identifier: null,
          identifierName: null,
          __typename: 'QLCEViewField'
        },
        {
          fieldId: 'cloudProvider',
          fieldName: 'Cloud Provider',
          identifier: null,
          identifierName: null,
          __typename: 'QLCEViewField'
        }
      ]
    }
  ] as QlceViewFieldIdentifierData[],
  provider: { id: 'COMMON', name: 'Common' },
  setService: jest.fn()
}

describe('Test Cases for Service Selector Component', () => {
  test('Should be able to render the component', () => {
    const { getByText } = render(
      <TestWrapper>
        <ServiceSelector {...props} />
      </TestWrapper>
    )

    expect(getByText('Product')).toBeDefined()

    act(() => {
      fireEvent.click(getByText('Product'))
    })

    expect(props.setService).toHaveBeenCalledWith({ id: 'product', name: 'Product' })
  })
})
