/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateConfigScriptStep from '../steps/DelegateConfigScriptStep'

const onFinishCb = jest.fn()

describe('Create Delegate Config Script step', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateConfigScriptStep name="script" onFinish={onFinishCb} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const finishBtn = container.getElementsByTagName('button')[1]
    act(() => {
      fireEvent.click(finishBtn!)
    })

    expect(onFinishCb).toBeCalled()
  })
})
