/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ModuleName } from 'framework/types/ModuleName'
import NavModule from '../NavModule'

describe('nav module test', () => {
  test('render', () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <NavModule module={ModuleName.CD} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(queryByText('common.purpose.cd.continuous')).toBeDefined()
  })

  test('test with checkbox', () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <NavModule module={ModuleName.CD} checkboxProps={{ checked: true }} />
      </TestWrapper>
    )

    screen.debug(container)
    expect(queryByText('common.purpose.cd.continuous')).toBeDefined()
  })
})
