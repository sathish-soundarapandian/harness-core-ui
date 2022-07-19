/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DelegateTypes } from '@delegates/constants'
import CommonProblems from '../CommonProblems'

describe('Create Common Problems Tab', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <CommonProblems />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render data by passing the delegate type', () => {
    const { getByText } = render(
      <TestWrapper>
        <CommonProblems delegateType={DelegateTypes.DOCKER} />
      </TestWrapper>
    )
    expect(getByText('delegates.delegateNotInstalled.verifyLogs2')).toBeInTheDocument()
  })
})
