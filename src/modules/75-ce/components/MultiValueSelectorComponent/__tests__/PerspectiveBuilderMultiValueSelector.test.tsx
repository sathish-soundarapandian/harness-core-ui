/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import PerspectiveBuilderMultiValueSelector from '../PerspectiveBuilderMultiValueSelector'

describe('Test Cases For PerspectiveBuilderMultiValueSelector', () => {
  test('Should Be Render When No Filter Values', async () => {
    const { queryByText } = render(
      <TestWrapper>
        <PerspectiveBuilderMultiValueSelector
          fetching={false}
          selectedValues={{ value1: true, value2: false, notvalue3: false }}
          setSelectedValues={jest.fn()}
          valueList={[]}
          fetchMore={jest.fn()}
          searchText={''}
          createNewTag={jest.fn()}
        />
      </TestWrapper>
    )

    expect(queryByText('create')).toBeNull()
  })
})
