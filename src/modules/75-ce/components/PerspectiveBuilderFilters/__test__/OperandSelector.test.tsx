/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, queryByText, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { OperandSelectorPopOverContent } from '../views/OperandSelector'

const fieldValuesList: any = [
  {
    identifier: 'COMMON',
    identifierName: 'Common',
    values: [
      {
        fieldId: 'region',
        fieldName: 'Region',
        identifier: null,
        identifierName: null,
        __typename: 'QLCEViewField'
      },
      {
        fieldId: 'product',
        fieldName: 'Product',
        identifier: null,
        identifierName: null,
        __typename: 'QLCEViewField'
      },
      {
        fieldId: 'label',
        fieldName: 'Label',
        identifier: null,
        identifierName: null,
        __typename: 'QLCEViewField'
      },
      {
        fieldId: 'none',
        fieldName: 'None',
        identifier: null,
        identifierName: null,
        __typename: 'QLCEViewField'
      }
    ],
    __typename: 'QLCEViewFieldIdentifierData'
  }
]

describe('test cases for filters operand selector', () => {
  test('should be able to render commons panel', async () => {
    const { container } = render(
      <TestWrapper>
        <OperandSelectorPopOverContent
          labelFetching={false}
          fieldValuesList={fieldValuesList}
          setProviderAndIdentifier={jest.fn()}
          labelData={['label 1', 'label 2', 'label 3', 'label 4']}
        />
      </TestWrapper>
    )

    const commonText = queryByText(container, 'Common')
    fireEvent.mouseOver(commonText!)
    await waitFor(() => expect(queryByText(container, 'Label')).toBeInTheDocument())

    const labelText = queryByText(container, 'Label')
    fireEvent.mouseOver(labelText!)
    await waitFor(() => expect(queryByText(container, 'label 1')).toBeInTheDocument())
  })
})
