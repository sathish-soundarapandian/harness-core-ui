/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color } from '@harness/design-system'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SimpleBar from '../SimpleBar'

describe('Simple Bar', () => {
  test('render successfully', () => {
    const { container } = render(
      <TestWrapper>
        <SimpleBar primaryColor={Color.PURPLE_500} widthInPercentage={50} />
      </TestWrapper>
    )
    expect(container.firstChild).toBeInTheDocument()
  })
})
