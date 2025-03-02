/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateTags } from '@templates-library/components/TemplateTags/TemplateTags'

describe('TemplateTags', () => {
  test('renders correctly', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <TemplateTags
          tags={{
            firstTagKey: 'tag_1',
            secondTagKey: 'tag_2'
          }}
        />
      </TestWrapper>
    )
    expect(getByText('firstTagKey:tag_1')).toBeInTheDocument()
    expect(getByText('secondTagKey:tag_2')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
