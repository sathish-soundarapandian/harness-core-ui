/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { CDInfoProps } from '../CDInfo';
import CDInfo from '../CDInfo'

const getProps = (): CDInfoProps => ({
  data: null,
  barrier: {
    barrierInfoLoading: false,
    barrierData: null
  }
})

describe('CDInfo', () => {
  test('matches snapshot when no data', () => {
    const props = getProps()
    const { container } = render(
      <TestWrapper>
        <CDInfo {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
